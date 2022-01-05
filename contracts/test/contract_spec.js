/*global artifacts, contract, it*/
/**/
const IOTNFT = artifacts.require("IOTNFT");
const TokenContract = artifacts.require("TokenContract");
const ERC20Token = artifacts.require("ERC20Token");
const utils = require("web3-utils");
var etherConverter = require("ether-converter");
const bigNumber = require("bignumber.js");
let initialAmount = new bigNumber(9991112121212111231190990211212).toFixed();
console.log("initialAmount: ", initialAmount);
let accounts,
  pixelOwn,
  tokenDetails,
  toCollect,
  adminBalance,
  adminBalanceAfter;

var tokenId;

//@notice for the purpose of the hackathon we only testing for positive test cases
// For documentation please see https://framework.embarklabs.io/docs/contracts_testing.html
config(
  {
    //deployment: {
    //  accounts: [
    //    // you can configure custom accounts with a custom balance
    //    // see https://framework.embarklabs.io/docs/contracts_testing.html#Configuring-accounts
    //  ]
    //},
    contracts: {
      deploy: {
        IOTNFT: {
          args: ["$TokenContract"],
          gas: "6000000",
          gasPrice: "250",
        },
        TokenContract: {
          args: ["IOTNFT", "IOTNFT"],
          gas: "6000000",
          gasPrice: "250",
        },
        ERC721: {
          args: ["IOTNFT", "IOTNFT"],
          gas: "6000000",
          gasPrice: "250",
        },
        ERC20Token: {
          args: [],
          gas: "6000000",
          gasPrice: "250",
        },
        // SimpleStorage: {
        //   fromIndex: 0,
        //   args: [100]
        // }
      },
    },
  },
  (_err, web3_accounts) => {
    accounts = web3_accounts;
    console.log("accounts: ", accounts);
  }
); /**/
contract("TokenContract", function() {
  it("should set the IOTNFT contract address ", async function() {
    let receipt = await TokenContract.methods
      .setContractIOTNFTAddress(IOTNFT.options.address)
      .send({
        from: accounts[0],
        gas: 6000000,
      });
    console.log("receipt: ", receipt);
  });
});

contract("ERC20Token", function() {
  it("should mint new erc20 tokens ", async function() {
    let receipt = await ERC20Token.methods
      .init("IOTNFTToken", "IOTNFT", 18, initialAmount)
      .send({ from: accounts[0], gas: 6000000 });
    console.log("receipt: ", receipt);
  });
});

contract("IOTNFT", function() {
  it("should mint a new token", async () => {
    var tokenPrice = etherConverter(20, "eth", "wei");
    var receipt = await IOTNFT.methods
      .mintToken(
        JSON.stringify({
          snr: 16400,
          vbat: 447,
          latitude: 487392578,
          longitude: 945399780,
          gasResistance: 94500,
          pressure: 45878,
          humidity: 2907,
          light: 68082,
          temperature2: 3498,
          gyroscope: [-6, 7, -3919],
          accelerometer: [3364, 3642, 3919],
          random: "380696d4c6edc426",
        }),
        tokenPrice,
        true
      )
      .send({
        from: accounts[0],
        gas: 5000000,
      });
    console.log(
      "newTokenMinted: ",
      receipt.events.newTokenMinted.returnValues.tokenId
    );
    assert.eventEmitted(receipt, "newTokenMinted");
  });
  it("should check the owner of the token minted ", async () => {
    var owner = await TokenContract.methods.ownerOf(1).call({ gas: 6000000 });
    console.log("owner: ", owner, " minter: ", accounts[0]);
    assert.strictEqual(
      IOTNFT.options.address == owner,
      true,
      "Token not delegated to contract"
    );
  });
  it("should buy a token with index 1", async () => {
    var tokenPrice = etherConverter(30, "eth", "wei");
    var token = await IOTNFT.methods.buyToken(1).send({
      from: accounts[1],
      gas: 5000000,
      value: tokenPrice,
    });
  });
  it("should check the owner of the token minted bought by account[1]", async () => {
    var owner = await TokenContract.methods.ownerOf(1).call({ gas: 6000000 });
    console.log("owner: ", owner, " minter account[1]: ", accounts[1]);
    assert.strictEqual(accounts[1] == owner, true, "account[1] not owner");
  });
  it("should get minter details", async () => {
    var details = await IOTNFT.methods.getMinterDetails(accounts[0]).call({
      from: accounts[1],
      gas: 5000000,
    });
    console.log("minter details: ", details);
  });

  it("should get token details details", async () => {
    var details = await IOTNFT.methods.getTokenDetails(1).call({
      from: accounts[1],
      gas: 5000000,
    });
    console.log("minter details:: ", details);
    assert.strictEqual(
      accounts[1] == details[0],
      true,
      "account[1] not found in minter details"
    );
  });

  /*************************** Token not delegated /***************************/
  it("should mint a new token", async () => {
    var tokenPrice = etherConverter(20, "eth", "wei");
    var receipt = await IOTNFT.methods
      .mintToken(
        JSON.stringify({
          snr: 16400,
          vbat: 447,
          latitude: 487392578,
          longitude: 945399780,
          gasResistance: 94500,
          pressure: 45878,
          humidity: 2907,
          light: 68082,
          temperature2: 3498,
          gyroscope: [-6, 7, -3919],
          accelerometer: [3364, 3642, 3919],
          random: "380696d4c6edc426",
        }),
        tokenPrice,
        false
      )
      .send({
        from: accounts[0],
        gas: 5000000,
      });
    console.log(
      "newTokenMinted not delegated: ",
      receipt.events.newTokenMinted.returnValues.tokenId
    );
    assert.eventEmitted(receipt, "newTokenMinted");
  });
  it("should check the owner of the token minted ", async () => {
    var owner = await TokenContract.methods.ownerOf(2).call({ gas: 6000000 });
    console.log("owner: ", owner, " minter: ", accounts[0]);
    assert.strictEqual(
      accounts[0] == owner,
      true,
      "Contract didnt mint token to accounts[0]"
    );
  });

  it("should transfer token to contract before buying ", async () => {
    var transfered = await TokenContract.methods
      .transferFrom(accounts[0], IOTNFT.options.address, 2)
      .send({ gas: 6000000, from: accounts[0] });
    console.log("transfered: ", transfered);
  });
  it("should check the token belongs to the contract before user can purchase ", async () => {
    var owner = await TokenContract.methods.ownerOf(2).call({ gas: 6000000 });
    console.log(
      "owner: ",
      owner,
      " IOTNFT.options.address: ",
      IOTNFT.options.address
    );
    assert.strictEqual(
      IOTNFT.options.address == owner,
      true,
      "Contract is not owner of token"
    );
  });
  it("should buy a token with index 2", async () => {
    var tokenPrice = etherConverter(30, "eth", "wei");
    var token = await IOTNFT.methods.buyToken(2).send({
      from: accounts[1],
      gas: 5000000,
      value: tokenPrice,
    });
  });
  it("should check the owner of the token minted bought by account[1]", async () => {
    var owner = await TokenContract.methods.ownerOf(2).call({ gas: 6000000 });
    console.log("owner: ", owner, " minter account[1]: ", accounts[1]);
    assert.strictEqual(accounts[1] == owner, true, "account[1] not owner");
  });
  it("should get minter details", async () => {
    var details = await IOTNFT.methods.getMinterDetails(accounts[0]).call({
      from: accounts[1],
      gas: 5000000,
    });
    console.log("minter details: ", details);
  });

  it("should get token details details", async () => {
    var details = await IOTNFT.methods.getTokenDetails(1).call({
      from: accounts[1],
      gas: 5000000,
    });
    console.log("minter details:: ", details);
    assert.strictEqual(
      accounts[1] == details[0],
      true,
      "account[1] not found in minter details"
    );
  });
  /*************************** Token not delegated and Paused/***************************/
  it("Should pause contract", async () => {
    var receipt = await IOTNFT.methods
      .pause()
      .send({ from: accounts[0], gas: 5000000 });
    console.log("contract paused: ", receipt);
    assert.eventEmitted(receipt, "Pause");
  });

  it("Should check if contract was paused", async () => {
    var paused = await IOTNFT.methods
      .paused()
      .call({ from: accounts[0], gas: 5000000 });
    console.log(
      "Should check if contract was pausedcontract paused: ",
      paused === true
    );
    assert.strictEqual(paused, true, "Contract not paused");
  });
  it("should mint a new token", async () => {
    var tokenPrice = etherConverter(20, "eth", "wei");
    await assert.reverts(
      IOTNFT.methods.mintToken(
        JSON.stringify({
          snr: 16400,
          vbat: 447,
          latitude: 487392578,
          longitude: 945399780,
          gasResistance: 94500,
          pressure: 45878,
          humidity: 2907,
          light: 68082,
          temperature2: 3498,
          gyroscope: [-6, 7, -3919],
          accelerometer: [3364, 3642, 3919],
          random: "380696d4c6edc426",
        }),
        tokenPrice,
        false
      ),
      {
        from: accounts[0],
        gas: 5000000,
      }
    );
  });
  it("should check the owner of the token minted ", async () => {
    await assert.reverts(TokenContract.methods.ownerOf(3), { gas: 6000000 });
  });

  it("should transfer token to contract before buying ", async () => {
    await assert.reverts(
      TokenContract.methods.transferFrom(
        accounts[0],
        IOTNFT.options.address,
        2
      ),
      { gas: 6000000, from: accounts[0] }
    );
  });
  it("should buy a token with index 3", async () => {
    var tokenPrice = etherConverter(30, "eth", "wei");
    await assert.reverts(IOTNFT.methods.buyToken(3), {
      from: accounts[1],
      gas: 5000000,
      value: tokenPrice,
    });
  });

  /*************************** Token not delegated and upause contract /***************************/
  it("Should unpause contract", async () => {
    var receipt = await IOTNFT.methods
      .unpause()
      .send({ from: accounts[0], gas: 5000000 });
    console.log("contract paused: ", receipt);
    assert.eventEmitted(receipt, "Unpause");
  });

  it("should mint a new token unpause", async () => {
    var tokenPrice = etherConverter(20, "eth", "wei");
    var receipt = await IOTNFT.methods
      .mintToken(
        JSON.stringify({
          snr: 16400,
          vbat: 447,
          latitude: 487392578,
          longitude: 945399780,
          gasResistance: 94500,
          pressure: 45878,
          humidity: 2907,
          light: 68082,
          temperature2: 3498,
          gyroscope: [-6, 7, -3919],
          accelerometer: [3364, 3642, 3919],
          random: "380696d4c6edc426",
        }),
        tokenPrice,
        false
      )
      .send({
        from: accounts[0],
        gas: 5000000,
      });
    console.log(
      "newTokenMinted not delegated: ",
      receipt.events.newTokenMinted.returnValues.tokenId
    );
    assert.eventEmitted(receipt, "newTokenMinted");
  });
  it("should check the owner of the token minted unpause", async () => {
    var owner = await TokenContract.methods.ownerOf(3).call({ gas: 6000000 });
    console.log("unpause owner unpause: ", owner, " minter: ", accounts[0]);
    assert.strictEqual(
      accounts[0] == owner,
      true,
      "Contract didnt mint token to accounts[0]"
    );
  });

  it("should transfer token to contract before buying unpause", async () => {
    var transfered = await TokenContract.methods
      .transferFrom(accounts[0], IOTNFT.options.address, 3)
      .send({ gas: 6000000, from: accounts[0] });
    console.log("transfered: ", transfered);
  });
  it("should check the token belongs to the contract before user can purchase ", async () => {
    var owner = await TokenContract.methods.ownerOf(3).call({ gas: 6000000 });
    console.log(
      "owner: ",
      owner,
      " IOTNFT.options.address: ",
      IOTNFT.options.address
    );
    assert.strictEqual(
      IOTNFT.options.address == owner,
      true,
      "Contract is not owner of token"
    );
  });
  it("should buy a token with index 3 unpause", async () => {
    var tokenPrice = etherConverter(30, "eth", "wei");
    var token = await IOTNFT.methods.buyToken(3).send({
      from: accounts[1],
      gas: 5000000,
      value: tokenPrice,
    });
  });
  it("should check the owner of the token minted bought by account[1] unpause", async () => {
    var owner = await TokenContract.methods.ownerOf(3).call({ gas: 6000000 });
    console.log("unpause owner: ", owner, " minter account[1]: ", accounts[1]);
    assert.strictEqual(accounts[1] == owner, true, "account[1] not owner");
  });
  it("should get minter details", async () => {
    var details = await IOTNFT.methods.getMinterDetails(accounts[0]).call({
      from: accounts[1],
      gas: 5000000,
    });
    console.log("minter details: ", details);
  });

  it("should get token details details unpause", async () => {
    var details = await IOTNFT.methods.getTokenDetails(1).call({
      from: accounts[1],
      gas: 5000000,
    });
    console.log("minter details:: ", details);
    assert.strictEqual(
      accounts[1] == details[0],
      true,
      "account[1] not found in minter details"
    );
  });
  /*************************** Fees /***************************/

  it("Should get the admins balance before", async () => {
    adminBalance = await web3.eth.getBalance(accounts[0]);
    adminBalance=etherConverter(adminBalance, "wei", "eth");
    console.log("balance before: ", adminBalance);
  });
  it("should get fees generated so far", async () => {
    var fees = await IOTNFT.methods.transactionFees().call({
      from: accounts[1],
      gas: 5000000,
    });
    toCollect = etherConverter(fees, "wei", "eth");
    console.log("transactionFees: ", fees, " in eth: ", toCollect);
    assert.strictEqual(fees > 0, true, "Fees not properly collected");
  });
  it("should collect all fees", async () => {
    var receipt = await IOTNFT.methods.withdrawFees().send({
      from: accounts[0],
      gas: 5000000,
    });
    console.log(
      "adminFeeCollection: ",
      receipt.events.adminFeeCollection.returnValues
    );
    assert.eventEmitted(receipt, "adminFeeCollection");
  });
  it("should get fees generated so far", async () => {
    var fees = await IOTNFT.methods.transactionFees().call({
      from: accounts[1],
      gas: 5000000,
    });
    console.log("transactionFees: ", fees, " in eth: ", etherConverter(fees, "wei", "eth"));
    assert.strictEqual(fees == 0, true, "Fees not properly collected");
  });
  it("Should get admin balance after", async () => {
    adminBalanceAfter = await web3.eth.getBalance(accounts[0]);
    adminBalanceAfter=etherConverter(adminBalanceAfter, "wei", "eth");
    console.log("balance after: ", adminBalance);
    assert.strictEqual(adminBalanceAfter>adminBalance,true, "Balance not affected")
  });
  it("Should check admin fees to be equal to that collected from contract", async () => {
    
    console.log("balance difference: ", bigNumber(adminBalanceAfter).minus(adminBalance).toFixed(1), " fee: ",toCollect);
    assert.strictEqual(bigNumber(adminBalanceAfter).minus(adminBalance).toFixed(1)===toCollect,true, "Balance not affected")
  });
});
