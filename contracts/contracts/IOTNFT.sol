pragma solidity >=0.6.2;
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import './interfaces/IOTNFTInterface.sol';
import "./TokenContract.sol";
import "./SafeMathV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ReentrancyGuard.sol";

//"SPDX-License-Identifier: UNLICENSED"


/**
*@dev contract represents the functionality required by OneCanvas 
*@notice mostly likey not optimised for gas will fix as i develop
*@notice implements the IOneCanvas interface 

 */
contract IOTNFT is IOTNFTInterface, Initializable, Ownable,ReentrancyGuard {
using SafeMathV2 for uint256;
 
/*==========================================================Modifier definition start==========================================================*/

/*==========================================================Event definition start==========================================================*/
/*==========================================================Variable definition start==========================================================*/
uint256 public transactionFees=0;
uint public minMintCost =0.01 ether;
uint public contractCut = 1000;
TokenContract ionft;
address [] mintersIds;
uint [] tokenIndexes;
mapping(uint => IOTNFT) currentIONFTs;
mapping(address => Minter) minters;

 /*==========================================================Function definition start==========================================================*/
 constructor (address tokenAddress)  public initializer {
     require(tokenAddress != address(0), "Invalid token address");
     require(msg.sender != address(0),"Invalid sender address");
     ionft =TokenContract(tokenAddress);
 }
 function mintToken (string memory tokenURI, uint256 tokenPrice) override public{
     require(msg.sender != address(0), "Invalid sender");
     require(tokenPrice>0 ,"Invalid token price");
     if(!minters[msg.sender].active){
         minters[msg.sender].id=msg.sender;
        minters[msg.sender].totalStaked=0;
         minters[msg.sender].active=true;
         mintersIds.push(msg.sender);
     }
    uint256 tokenId = ionft.mintToken(address(this),tokenURI);
    currentIONFTs[tokenId].tokenId=tokenId;
    currentIONFTs[tokenId].originalPrice=tokenPrice;
    currentIONFTs[tokenId].price=tokenPrice;
    currentIONFTs[tokenId].exists=true;
    currentIONFTs[tokenId].owner=msg.sender;
    emit newTokenMinted(msg.sender,tokenId,currentIONFTs[tokenId].price);
}

function buyToken(uint256 tokenId) override public payable nonReentrant{
    require(msg.sender != address(0), "Invalid sender");
    require(ionft.tokenExists(tokenId), "Token not minted yet" );
    require(currentIONFTs[tokenId].exists, "Token not active" );
    require(msg.sender != currentIONFTs[tokenId].owner, "Owner not allowed to buy own nft");
    require(msg.value > currentIONFTs[tokenId].price, "Invalid buying price");


    uint256 tempPrice=getContractCut(msg.value.sub(currentIONFTs[tokenId].price));
    transactionFees = transactionFees.add(tempPrice);
    uint256 remaining = msg.value.sub(tempPrice);
    require(currentIONFTs[tokenId].owner.send(remaining), "Insufficient funds");
    currentIONFTs[tokenId].price=currentIONFTs[tokenId].price.add(remaining);
    currentIONFTs[tokenId].previousOwners.push(msg.sender);
    minters[currentIONFTs[tokenId].owner].totalStaked=minters[currentIONFTs[tokenId].owner].totalStaked.add(remaining);
    address previousOwner=currentIONFTs[tokenId].owner;
    currentIONFTs[tokenId].owner=msg.sender;
  //  pixel.transferFrom(address(this),msg.sender,tokenId);
    emit transferTokenOwnerShip(msg.sender,previousOwner,msg.value,tokenId,tempPrice); 
}
 
function getMinterDetails(address id) override public view returns (uint256,bool){
 return (minters[id].totalStaked,minters[id].active);
}


function getMinterKeys() override public view returns (address [] memory){
 return mintersIds;
}


function getTokenIndexes() override public view returns (uint [] memory){
return tokenIndexes;
}

  function getTokenDetails(uint256 tokenId) public override returns(address,uint256,uint256,address[] memory ,bool){
      return (currentIONFTs[tokenId].owner,currentIONFTs[tokenId].price,currentIONFTs[tokenId].originalPrice,currentIONFTs[tokenId].previousOwners,currentIONFTs[tokenId].exists);
  }

function burnToken(uint256 tokenId) public {
    ionft.burnToken(tokenId);
}

function getContractCut(uint256 value)  internal view returns (uint256)  {
    uint256 roundValue = value.ceil(100);
    uint256 cut =roundValue.mul(contractCut).div(10000);
    return cut;
}
}