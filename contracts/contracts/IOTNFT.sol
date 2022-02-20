pragma solidity >=0.6.2;
pragma experimental ABIEncoderV2;

import "./IOTNFTERC20Token.sol";
import "./Initializable.sol";
import "./interfaces/IOTNFTInterface.sol";
import "./TokenContract.sol";
import "./SafeMathV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ReentrancyGuard.sol";

import "./Pausable.sol";
import {ISuperfluid, ISuperToken, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

//"SPDX-License-Identifier: UNLICENSED"

/**
*@dev contract represents the functionality required by OneCanvas 
*@notice mostly likey not optimised for gas will fix as i develop
*@notice implements the IOneCanvas interface 
 @dev has bugs 
 @notice poorly formatted code

 */
contract IOTNFT is
    IOTNFTInterface,
    Initializable,
    Ownable,
    ReentrancyGuard,
    Pausable
{
    using SafeMathV2 for uint256;

    /*==========================================================Modifier definition start==========================================================*/

    /*==========================================================Event definition start==========================================================*/
    /*==========================================================Variable definition start==========================================================*/
    uint256 private fundIndexIds;
    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token
    IInstantDistributionAgreementV1 instantDistributionAgreement;
    uint256 public transactionFees = 0;
    uint256 public minMintCost = 0.01 ether;
    uint256 public contractCut = 3500;
    uint256 minDividendsPerExperience = 100;
    address payable contractOwner;
    uint32 private constant INDEX_ID = 0;
    TokenContract ionft;
    address[] mintersIds;

    mapping(uint256 => int96) public flowRates;
    mapping(uint256 => IOTNFT) currentIONFTs;
    mapping(address => Minter) minters;

    /*==========================================================Function definition start==========================================================*/
    constructor(
        TokenContract tokenAddress,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken,
        IInstantDistributionAgreementV1 ida
    ) initializer {
        require(address(tokenAddress) != address(0), "Invalid token address");
        require(msg.sender != address(0), "Invalid sender address");
        require(address(host) != address(0), "Invalid host address");
        require(address(cfa) != address(0), "Invalid CFA address");
        require(address(ida) != address(0), "Invalid IDA address");

        require(
            address(acceptedToken) != address(0),
            "Invalid supertoken address"
        );
        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;
        ionft = tokenAddress;
        instantDistributionAgreement = ida;
        contractOwner = msg.sender;
        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;
        _host.registerApp(configWord);
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
        bool delegate,
        uint256 maxLeaseDays
    ) public override whenNotPaused {
        require(msg.sender != address(0), "Invalid sender");
        require(tokenPrice > 0, "Invalid token price");
        require(maxLeaseDays > 0, "Max lease must be positive");
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
        currentIONFTs[tokenId].maxRentableDays = maxLeaseDays;
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
        require(!currentIONFTs[tokenId].rentedOut, "Not possible to buy");
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

    function rentNFT(
        uint256 tokenId,
        uint256 duration,
        int96 flowRate
    ) public override nonReentrant whenNotPaused {
        require(msg.sender != address(0), "Invalid sender address");
        require(
            currentIONFTs[tokenId].exists &&
                ionft.tokenExists(tokenId) &&
                currentIONFTs[tokenId].delegated,
            "Token not listed or exists or delegated"
        );
        require(!currentIONFTs[tokenId].rentedOut, "Token not available");
        require(
            currentIONFTs[tokenId].owner != msg.sender,
            "Owner Cannot rent"
        );
        require(
            duration > 0 && currentIONFTs[tokenId].maxRentableDays >= duration,
            "Invalid duration"
        );
        currentIONFTs[tokenId].borrowedAt = block.timestamp;
        currentIONFTs[tokenId].currentBorrower.duration = duration; //@dev in days
        currentIONFTs[tokenId].currentBorrower.owner = msg.sender;
        currentIONFTs[tokenId].currentBorrower.exists = true;
        currentIONFTs[tokenId].rentedOut = true;
        _createFlow(currentIONFTs[tokenId].owner, flowRate); //@dev create flow to user
        emit nftRentedOut(msg.sender, duration, tokenId);
    }

    function returnNFT(uint256 tokenId) public override nonReentrant {
        require(
            currentIONFTs[tokenId].exists &&
                ionft.tokenExists(tokenId) &&
                currentIONFTs[tokenId].delegated,
            "Token not listed or exists or delegated"
        );
        require(
            currentIONFTs[tokenId].currentBorrower.owner == msg.sender,
            "not borrower"
        );
        ionft.transferFrom(msg.sender, address(this), tokenId);
        _deleteFlow(msg.sender, address(this));
        delete currentIONFTs[tokenId].currentBorrower;
        currentIONFTs[tokenId].rentedOut = false;
        emit nftReturned(msg.sender, tokenId, block.timestamp);
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

    function getTokenDetails(uint256 tokenId)
        public
        view
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

    /*==============================Superfluid ============================*/

    function _createFlow(address to, int96 flowRate) internal {
        if (to == address(this) || to == address(0)) return;
        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.createFlow.selector,
                _acceptedToken,
                to,
                flowRate,
                new bytes(0)
            ),
            new bytes(0)
        );
    }

    function _deleteFlow(address from, address to) internal {
        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.deleteFlow.selector,
                _acceptedToken,
                from,
                to,
                new bytes(0) // placeholder
            ),
            new bytes(0)
        );
    }

    function getNFTRealTimeBalance(uint256 tokenId)
        public
        view
        returns (
            int256,
            uint256,
            uint256
        )
    {
        require(
            currentIONFTs[tokenId].exists &&
                ionft.tokenExists(tokenId) &&
                currentIONFTs[tokenId].delegated,
            "Token not listed or exists or delegated"
        );
        int256 availableBalance;
        uint256 deposit;
        uint256 owedDeposit;
        uint256 timestamp;
        (availableBalance, deposit, owedDeposit, timestamp) = _acceptedToken
            .realtimeBalanceOfNow(currentIONFTs[tokenId].owner);
        return (availableBalance, deposit, owedDeposit);
    }
}
