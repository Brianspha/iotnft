var IONFT = artifacts.require("IOTNFT");
var IONFTToken = artifacts.require("TokenContract");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(IONFTToken, "IOTNFT", "IOTNFT").then((IONFTTokenDeployed) => {
    console.log("deployed token contract: ", IONFTTokenDeployed.address);
    return deployer
      .deploy(IONFT, IONFTTokenDeployed.address)
      .then(async function(IONFTDeployed) {
        IONFT = await IONFT.deployed();
        IONFTToken = await IONFTToken.deployed();
        var receipt = await IONFTToken.setContractIOTNFTAddress(
          IONFTDeployed.address
        );
        console.log(
          "Succesfully set ionft address inside nft contract: ",
          receipt
        );
      });
  });
};
