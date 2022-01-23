var Contract = require("web3-eth-contract");
Contract.setProvider("http://localhost:8546");


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
