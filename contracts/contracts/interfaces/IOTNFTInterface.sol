pragma solidity >=0.6.2;

// SPDX-License-Identifier: MIT

/// @title IOTNFTInterface
/// @author brianspha
/// @notice This inteface contains all functions required for the IOTNFT contract
/// @dev Any contract that inherits this interface will have to implement all functions also WIP

interface IOTNFTInterface {
    //************************************Modifier Definition ************************************************************ */

    struct IOTNFT {
        //@dev we can add previous owners array
        uint256 tokenId;
        address payable owner;
        bool delegated;
        uint256 price;
        uint256 originalPrice;
        bool exists;
    }
    struct Minter {
        address payable id;
        uint256 totalStaked;
        bool active;
    }
    //************************************Modifier Definition ************************************************************ */
    /// @notice Checks if a given user address owns a given token id
    /// @param user address to check against ownership of a given token id
    modifier ownsToken(address user) virtual {
        _;
    }

    //************************************Event Definition ************************************************************ */
    /// @notice Event is emmited whwenever a new token is minted
    event newTokenMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 indexed tokenPrice
    );
    /// @notice Event is emmited whwenever a new token changes ownership
    event transferTokenOwnerShip(
        address indexed owner,
        address indexed previousOwner,
        uint256 cost,
        uint256 tokenIndex,
        uint256 contractCut
    );
    /// @notice Event is emmited whwenever a new token is purchased
    event adminFeeCollection(uint256 indexed date, uint256 indexed amount);
    /// @notice Event is emmited whwenever a token is delegated to be listed on the contract
    event delegatedToken(uint256 indexed tokenId);
    /// @notice Event is emmited whwenever a token is delegated to be delisted on the contract
    event revokedDelegatedToken(uint256 indexed tokenId);

    //************************************Function Definition ************************************************************ */
    /**
 *@dev called when a user mints a token from pebble data
 @param tokenPrice- The price the token is to be sold for
 @param tokenURI - the json data associated with the current pixel
 @notice function doesnt return a value just emits a value using the **pixelColored** event
  */
    function mintToken(
        string calldata tokenURI,
        uint256 tokenPrice,
        bool delegate
    ) external;

    /// @notice Fetches all  registered minter keys from the smart contract storage
    /// @return minter addresses
    function getMinterKeys() external view returns (address[] memory);

    /// @dev Fetches all token indexes registered on the smartcontract storage
    /// @return token indexes
    function getTokenIndexes() external view returns (uint256[] memory);

    /// @notice Gets token info based on the given tokenId
    /// @param tokenId the id of the token
    /// @return the token details
    function getTokenDetails(uint256 tokenId)
        external
        returns (
            address,
            uint256,
            uint256,
            bool,
            bool
        );

    /// @notice returns an minter details
    /// @param id the id of the token
    /// @return returns an minter details
    function getMinterDetails(address id) external view returns (uint256, bool);

    /// @notice allows a user to purchase a token
    /// @param tokenId The token index

    function buyToken(uint256 tokenId) external payable;

    /// @notice allows the admin to withdraw the tx fees

    function withdrawFees() external payable;

    /// @notice Delegates a token to the smartcontract for others to purchase
    /// @dev Before a user is able to purchase a token the owner of the the token must delegate it to the smartcontract
    /// @param tokenId the id of the token

    function delegateNFT(uint256 tokenId) external;

    /// @notice allows the user to revoke delagation of token from the contract
    /// @dev The owner of the token must be the one to call this function and must have deletgated the token prior
    /// @param tokenId the id of the token

    function revokeDelegatedNFT(uint256 tokenId) external;
}
