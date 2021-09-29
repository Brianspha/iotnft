pragma solidity >=0.6.2;
//"SPDX-License-Identifier: UNLICENSED"


/**
*@dev represents the function signatures to be implemented by the OneCanvas contract or any other contract
 */
interface IOTNFTInterface {

/*==========================================================Struct definition start==========================================================*/

struct IOTNFT{
   uint256 tokenId;
    address payable owner;
    uint price;
    uint originalPrice;
    address[] previousOwners;
    bool exists;
}
struct Minter{
    address payable id;
    uint256 totalStaked;
    bool active;
}
/*==========================================================Modifier definition start==========================================================*/

  //@dev restricts function call to pixel owner
  modifier ownsToken (address user) virtual{
_;
}

/*==========================================================Event definition start==========================================================*/
   //@dev called when a user mints a token from the pebble data
 event newTokenMinted(address indexed owner,uint256 indexed tokenId,uint256 indexed tokenPrice);
  //@dev called when a token ownership is transferred from one user to another
event transferTokenOwnerShip(address indexed owner, address indexed previousOwner,uint256 cost, uint256 tokenIndex,uint256 contractCut);
/*==========================================================Function definition start==========================================================*/
 /**
 *@dev called when a user mints a token from pebble data
 @param tokenPrice- The price the token is to be sold for
 @param tokenURI - the json data associated with the current pixel
 @notice function doesnt return a value just emits a value using the **pixelColored** event
  */
 function mintToken( string calldata tokenURI, uint256 tokenPrice) external ;

  /**
 *@dev returns all MINTER eth addresses
  */
  function getMinterKeys() external view returns(address[] memory);

  /**
 *@dev returns all token indexes
  */
 function getTokenIndexes() external view returns (uint[] memory);
  /**
   *dev gets token info based on the given tokenId
   * returns the token details
   */

  function getTokenDetails(uint256 tokenId) external returns(address,uint256,uint256,address[] memory,bool);
  
  /**
 *@dev returns an minter details
 @param id- The address of the minter to get information for 
  */
 function getMinterDetails(address id) external view returns (uint256,bool);
 /**
 *@dev allows a user to purchase a token
 @param id- The token index
  */
function buyToken (uint256 id) external payable;

}