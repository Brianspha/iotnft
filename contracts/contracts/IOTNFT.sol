pragma solidity >=0.6.2;
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./interfaces/IOTNFTInterface.sol";
import "./TokenContract.sol";
import "./SafeMathV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "./ReentrancyGuard.sol";

import "./Pausable.sol";

//"SPDX-License-Identifier: UNLICENSED"

/**
*@dev contract represents the functionality required by OneCanvas 
*@notice mostly likey not optimised for gas will fix as i develop
*@notice implements the IOneCanvas interface 

 */
contract IOTNFT is
    IOTNFTInterface,
    Initializable,
    Ownable,
    ReentrancyGuard,
    Pausable,
    ERC721Holder
{
    using SafeMathV2 for uint256;

    /*==========================================================Modifier definition start==========================================================*/

    /*==========================================================Event definition start==========================================================*/
    /*==========================================================Variable definition start==========================================================*/
    uint256 public transactionFees = 0;
    uint256 public minMintCost = 0.01 ether;
    uint256 public contractCut = 3500;
    address payable contractOwner;
    TokenContract ionft;
    address[] mintersIds;
    uint256[] tokenIndexes;
    mapping(uint256 => IOTNFT) currentIONFTs;
    mapping(address => Minter) minters;

    /*==========================================================Function definition start==========================================================*/
    constructor(address tokenAddress) public initializer {
        require(tokenAddress != address(0), "Invalid token address");
        require(msg.sender != address(0), "Invalid sender address");
        ionft = TokenContract(tokenAddress);
        contractOwner = msg.sender;
    }

    function withdrawFees() public payable override onlyOwner nonReentrant {
        require(transactionFees > 0, "Nothing to withdraw");
        uint256 fees = transactionFees;
        transactionFees = 0;
        require(contractOwner.send(fees), "Insufficient funds");
        emit adminFeeCollection(block.timestamp, fees);
    }

    function mintToken(
        string memory tokenURI,
        uint256 tokenPrice,
        bool delegate
    ) public override whenNotPaused {
        require(msg.sender != address(0), "Invalid sender");
        require(tokenPrice > 0, "Invalid token price");
        if (!minters[msg.sender].active) {
            minters[msg.sender].id = msg.sender;
            minters[msg.sender].totalStaked = 0;
            minters[msg.sender].active = true;
            mintersIds.push(msg.sender);
        }
        uint256 tokenId;
        if (delegate) {
            tokenId = ionft.mintToken(address(this), tokenURI);
        } else {
            tokenId = ionft.mintToken(msg.sender, tokenURI);
        }
        require(ionft.tokenExists(tokenId), "Token not minted");
        currentIONFTs[tokenId].delegated = delegate;
        currentIONFTs[tokenId].tokenId = tokenId;
        currentIONFTs[tokenId].originalPrice = tokenPrice;
        currentIONFTs[tokenId].price = tokenPrice;
        currentIONFTs[tokenId].exists = true;
        currentIONFTs[tokenId].owner = msg.sender;
        emit newTokenMinted(msg.sender, tokenId, currentIONFTs[tokenId].price);
    }

    function buyToken(uint256 tokenId)
        public
        payable
        override
        nonReentrant
        whenNotPaused
    {
        require(currentIONFTs[tokenId].delegated, "Token not delegated");
        require(msg.sender != address(0), "Invalid sender");
        require(
            ionft.tokenExists(tokenId) && currentIONFTs[tokenId].exists,
            "Token not minted yet or not active"
        );
        require(
            msg.sender != currentIONFTs[tokenId].owner &&
                ionft.ownerOf(tokenId) != msg.sender,
            "Owner not allowed to buy own nft"
        );
        require(
            msg.value > currentIONFTs[tokenId].price,
            "Invalid buying price"
        );
        require(currentIONFTs[tokenId].delegated, "token not delegated");
        uint256 soldPrice = msg.value;
        uint256 tempPrice = getContractCut(
            msg.value.sub(currentIONFTs[tokenId].price)
        );
        transactionFees = transactionFees.add(tempPrice);
        uint256 remaining = msg.value.sub(tempPrice);
        require(
            currentIONFTs[tokenId].owner.send(remaining),
            "Insufficient funds"
        );
        currentIONFTs[tokenId].price = soldPrice;
        minters[currentIONFTs[tokenId].owner].totalStaked = minters[
            currentIONFTs[tokenId].owner
        ].totalStaked.add(remaining);
        address previousOwner = currentIONFTs[tokenId].owner;
        currentIONFTs[tokenId].owner = msg.sender;
        currentIONFTs[tokenId].delegated = false;
        ionft.transferFrom(address(this), msg.sender, tokenId);
        emit transferTokenOwnerShip(
            msg.sender,
            previousOwner,
            msg.value,
            tokenId,
            tempPrice
        );
    }

    function revokeDelegatedNFT(uint256 tokenId) public override {
        require(msg.sender != address(0), "Invalid sender address");
        require(
            currentIONFTs[tokenId].exists && ionft.tokenExists(tokenId),
            "Token not listed or exists"
        );
        require(ionft.ownerOf(tokenId) == address(this), "Contract Not Owner");
        require(currentIONFTs[tokenId].delegated, "Token not delegated");
        ionft.transferFrom(address(this), msg.sender, tokenId);
        currentIONFTs[tokenId].delegated = false;
        emit revokedDelegatedToken(tokenId);
    }

    function delegateNFT(uint256 tokenId) public override {
        require(msg.sender != address(0), "Invalid sender address");
        require(
            currentIONFTs[tokenId].exists && ionft.tokenExists(tokenId),
            "Token not listed or exists"
        );
        require(ionft.ownerOf(tokenId) == address(this), "Contract Not Owner");
        require(!currentIONFTs[tokenId].delegated, "Token already delegated");
        currentIONFTs[tokenId].delegated = true;
        emit delegatedToken(tokenId);
    }

    function getMinterDetails(address id)
        public
        view
        override
        returns (uint256, bool)
    {
        return (minters[id].totalStaked, minters[id].active);
    }

    function getMinterKeys() public view override returns (address[] memory) {
        return mintersIds;
    }

    function getTokenIndexes() public view override returns (uint256[] memory) {
        return tokenIndexes;
    }

    function getTokenDetails(uint256 tokenId)
        public
        override
        returns (
            address,
            uint256,
            uint256,
            bool,
            bool
        )
    {
        return (
            currentIONFTs[tokenId].owner,
            currentIONFTs[tokenId].price,
            currentIONFTs[tokenId].originalPrice,
            currentIONFTs[tokenId].exists,
            currentIONFTs[tokenId].delegated
        );
    }

    function burnToken(uint256 tokenId) public whenNotPaused {
        ionft.burnToken(tokenId);
    }

    function getContractCut(uint256 value) internal view returns (uint256) {
        uint256 roundValue = value.ceil(100);
        uint256 cut = roundValue.mul(contractCut).div(10000);
        return cut;
    }
}
