const IOTNFT = artifacts.require("IOTNFT");
const IONFTToken = artifacts.require("TokenContract");
let IOTNFTERC20Token = artifacts.require("IOTNFTERC20Token");
const bigNumber = require("bignumber.js");
let initialAmount = new bigNumber(9991112121212111231190990211212).toFixed();
const { web3tx } = require("@decentral.ee/web3-helpers");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
console.log("initialAmount: ", initialAmount);
module.exports = async function(callback, argv) {
  const errorHandler = (err) => {
    if (err) throw err;
  };

  try {
    global.web3 = web3;

    const version = process.env.yare || "test";
    console.log("release version in deploy:", version);

    const sf = new SuperfluidSDK.Framework({
      chainId: 5,
      version: version,
      web3Provider: deployer.currentProvider,
    });
    await sf.initialize();
    const daiAddress = await sf.resolver.get("tokens.fDAI");
    const dai = await sf.contracts.TestToken.at(daiAddress);
    const daixWrapper = await sf.getERC20Wrapper(dai);
    const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress);
    const IOTNFTTokenDeployed = await new IONFTToken("IOTNFT", "IOTNFT");
    console.log("deployed nft token contract: ", IOTNFTTokenDeployed.address);

    var IOTNFTERC20TokenDeployed = await deployer.deploy(IOTNFTERC20Token);
    console.log(
      "deployed IOTNFT ERC20 token: ",
      IOTNFTERC20TokenDeployed.address
    );
    var receipt = await IOTNFTERC20Token.init(
      "IOTNFT",
      "IOTNFT",
      18,
      initialAmount
    );

    console.log("initialised IONFT token details ", receipt);
    const IONFTDeployed = await new IOTNFT(
      IOTNFTTokenDeployed.address,
      sf.host.address,
      sf.agreements.cfa.address,
      daix.address,
      sf.agreements.ida.address
    );
    console.log("deployed IOTNFT contract: ", IONFTDeployed.address);
    receipt = await IONFTToken.setContractIOTNFTAddress(IONFTDeployed.address);
    console.log("set setContractIOTNFTAddress in nft contract: ",receipt)
    console.log("DONE WITH DEPLOYMENTS")
    callback();
  } catch (err) {
    callback(err);
  }
};
module.exports = function(deployer, network, accounts) {};
