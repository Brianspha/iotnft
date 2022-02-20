pragma solidity >=0.6.2;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//"SPDX-License-Identifier: UNLICENSED"

/**
 *@dev represents the function signatures to be implemented by the OneCanvas contract or any other contract
 */
interface IOTNFTInterface {
    /*==========================================================Struct definition start==========================================================*/

    struct IOTNFT {
        //@dev we can add previous owners array
        uint256 tokenId;
        address payable owner;
        bool delegated;
        uint256 price;
        uint256 originalPrice;
        uint maxRentableDays;
        uint256 borrowedAt;
        Borrower currentBorrower;
        bool exists;
        bool rentedOut;
    }
    struct Borrower {
        address payable owner;
        uint duration;
        bool exists;
    }

    struct Minter {
        address payable id;
        uint256 totalStaked;
        bool active;
    }
    /*==========================================================Modifier definition start==========================================================*/

    //@dev restricts function call to pixel owner
    modifier ownsToken(address user) virtual {
        _;
    }

    /*==========================================================Event definition start==========================================================*/
    //@dev called when a user mints a token from the pebble data
    event newTokenMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 indexed tokenPrice
    );
    //@dev called when a token ownership is transferred from one user to another
    event transferTokenOwnerShip(
        address indexed owner,
        address indexed previousOwner,
        uint256 cost,
        uint256 tokenIndex,
        uint256 contractCut
    );
    event nftRentedOut(
        address indexed user,
        uint256 indexed duration,
        uint256 indexed tokenId
    );
    event nftReturned(
        address indexed user,
        uint256 indexed tokenId,
        uint256 indexed date
    );
    event adminFeeCollection(uint256 indexed date, uint256 indexed amount);
    event delegatedToken(uint256 indexed tokenId);
    event revokedDelegatedToken(uint256 indexed tokenId);

    /*==========================================================Function definition start==========================================================*/
    /**
 *@dev called when a user mints a token from pebble data
 @param tokenPrice- The price the token is to be sold for
 @param tokenURI - the json data associated with the pebble data point
 @notice function doesnt return a value just emits a value using the **pixelColored** event
  */
    function mintToken(
        string memory tokenURI,
        uint256 tokenPrice,
        bool delegate,
        uint256 maxLeaseDays
    ) external;

    /**
     *@dev returns all MINTER eth addresses
     */
    function getMinterKeys() external view returns (address[] memory);

    /**
     *dev gets token info based on the given tokenId
     * returns the token details
     */

    function getTokenDetails(uint256 tokenId)
        external
        returns (
            address,
            uint256,
            uint256,
            bool,
            bool
        );

    /**
 *@dev returns an minter details
 @param id- The address of the minter to get information for 
  */
    function getMinterDetails(address id) external view returns (uint256, bool);

    /**
 *@dev allows a user to purchase a token
 @param id- The token index
  */
    function buyToken(uint256 id) external payable;

    /**
 *@dev allows the admin to withdraw the tx fees 

  */
    function withdrawFees() external payable;

    /**
 *@dev allows the user to delegate the token to the contract

  */
    function delegateNFT(uint256 tokenId) external;

    /**
 *@dev allows the user to revoke delagation of token from the contract

  */
    function revokeDelegatedNFT(uint256 tokenId) external;

    /**
    * @dev allows users to share an experience of a pebble owner by owning a part of the NFT minted by the user
    
     */
    function rentNFT(
        uint256 tokenId,
        uint duration,
        int96 flowRate
    ) external;

    function returnNFT(uint256 tokenId) external;
}
