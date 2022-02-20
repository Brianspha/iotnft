const { web3tx } = require("@decentral.ee/web3-helpers");
const SuperfluidSDK = require("@superfluid-finance/ethereum-contracts");
const liquidbusary = artifacts.require("LiquidBusaryV1");
var Contract = require("web3-eth-contract");
Contract.setProvider("http://localhost:8546");
module.exports = async function(callback, argv) {
  const errorHandler = (err) => {
    if (err) throw err;
  };

  try {
    global.web3 = web3;

    const version = process.env.yare || "test";
    console.log("release version:", version);

    const sf = new SuperfluidSDK.Framework({
      chainId: 5,
      version: version,
      web3Provider: web3.currentProvider,
    });
    await sf.initialize();
    const daiAddress = await sf.resolver.get("tokens.fDAI");
    const dai = await sf.contracts.TestToken.at(daiAddress);
    const daixWrapper = await sf.getERC20Wrapper(dai);
    const daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)


var tokenContract = new Contract(
  require("./build/contracts/TokenContract.json").abiDefinition,"",
  {
    from: "0x169dc1Cfc4Fd15ed5276B12D6c10CE65fBef0D11", // default from address
    gasPrice: "20000000000", // default gas price in wei, 20 gwei in this case
  }
);
tokenContract
  .deploy({
    data: require("./build/contracts/TokenContract.json").runtimeBytecode,
    arguments: ["IONFT", "IONFT"],
  })
  .send(
    {
      from: "0x169dc1Cfc4Fd15ed5276B12D6c10CE65fBef0D11",
      gas: 500000,
      gasPrice: "30000000000000",
    },
    function(error, transactionHash) {
      console.log("deployed tokenContract: ", error);
    }
  );
    console.log("App deployed at", app.address);
    callback();
  } catch (err) {
    callback(err);
  }
};






