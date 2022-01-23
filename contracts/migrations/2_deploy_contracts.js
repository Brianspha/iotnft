const IONFT = artifacts.require("IOTNFT");
const IONFTToken = artifacts.require("TokenContract");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(IONFTToken, "IOTNFT", "IOTNFT").then((IONFTTokenDeployed)=>{
    console.log("deployed token contract: ", IONFTTokenDeployed.address);
   return deployer.deploy(IONFT, IONFTTokenDeployed.address).then(function(IONFTDeployed) {
      console.log("deploying IONFT: ", IONFT.address);
    });
  });
 
};
