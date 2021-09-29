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
let accounts, pixelOwn, tokenDetails;

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
        tokenPrice
      )
      .send({
        from: accounts[0],
        gas: 5000000,
      });
      console.log("newTokenMinted: ",receipt.events.newTokenMinted.returnValues.tokenId)
    assert.eventEmitted(receipt, "newTokenMinted");
  });

  it("should a token with index 1", async () => {
    var tokenPrice = etherConverter(30, "eth", "wei");
    var token = await IOTNFT.methods.buyToken(1).send({
      from: accounts[1],
      gas: 5000000,
      value: tokenPrice,
    });
  });

  it("should get minter details", async () => {
    var details = await IOTNFT.methods.getMinterDetails(accounts[0]).call({
      from: accounts[0],
      gas: 5000000,
    });
    console.log("details: ", details);
  });

  it("should get token details details", async () => {
    var details = await IOTNFT.methods.getTokenDetails(1).call({
      from: accounts[0],
      gas: 5000000,
    });
    console.log("details: ", details);
  });
});
