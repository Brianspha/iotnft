const { web3tx, toWad, wad4human } = require("@decentral.ee/web3-helpers");

const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");
const IOTNFT = artifacts.require("IOTNFT");
const TokenContract = artifacts.require("TokenContract");
let IOTNFTERC20Token = artifacts.require("IOTNFTERC20Token");
const bigNumber = require("bignumber.js");
let initialAmount = new bigNumber(229999999999999999).toFixed();
var etherConverter = require("ether-converter");

const traveler = require("ganache-time-traveler");
const TEST_TRAVEL_TIME = 3600 * 2; // 1 hours

contract("IOTNFT", (accounts) => {
  const errorHandler = (err) => {
    if (err) throw err;
  };

  const names = ["Admin", "Alice", "Bob"];
  accounts = accounts.slice(0, names.length);
  let IONFTTokenDeployed, IOTNFTERC20TokenDeployed;
  let sf;
  let dai;
  let daix;
  let app;
  let tokenIds = [];
  const u = {}; // object with all users
  const aliases = {};

  before(async function() {
    //process.env.RESET_SUPERFLUID_FRAMEWORK = 1;
    await deployFramework(errorHandler, {
      web3,
      from: accounts[0],
      newTestResolver: true,
    });

    await deployTestToken(errorHandler, [":", "fDAI"], {
      web3,
      from: accounts[0],
    });
    await deploySuperToken(errorHandler, [":", "fDAI"], {
      web3,
      from: accounts[0],
    });

    sf = new SuperfluidSDK.Framework({
      web3,
      version: "test",
      tokens: ["fDAI"],
    });

    await sf.initialize();
    daix = sf.tokens.fDAIx;
    dai = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address);

    for (var i = 0; i < names.length; i++) {
      u[names[i].toLowerCase()] = sf.user({
        address: accounts[i],
        token: daix.address,
      });
      u[names[i].toLowerCase()].alias = names[i];
      aliases[u[names[i].toLowerCase()].address] = names[i];
    }
    for (const [, user] of Object.entries(u)) {
      if (user.alias === "App") return;
      await web3tx(dai.mint, `${user.alias} mints many dai`)(
        user.address,
        toWad(999000000000),
        {
          from: user.address,
        }
      );
      await web3tx(dai.approve, `${user.alias} approves daix`)(
        daix.address,
        toWad(999000000000),
        {
          from: user.address,
        }
      );
    }
    //u.zero = { address: ZERO_ADDRESS, alias: "0x0" };
    console.log(u.admin.address);
    console.log(sf.host.address);
    console.log(sf.agreements.cfa.address);
    console.log(daix.address);
    IONFTTokenDeployed = await TokenContract.new("IOTNFT", "IOTNFT");
    IOTNFTERC20TokenDeployed = await IOTNFTERC20Token.new();
    console.log(
      "deployed IOTNFT ERC20 token: ",
      IOTNFTERC20TokenDeployed.address
    );
    var receipt = await IOTNFTERC20TokenDeployed.init(
      "IOTNFT",
      "IOTNFT",
      18,
      initialAmount
    );
    console.log("initialised IONFT token details ", receipt);
    console.log(
      "IONFTTokenDeployed.address: " + IONFTTokenDeployed.address,
      "\nsf.host.address: " + sf.host.address,
      "\nsf.agreements.cfa.address: " + sf.agreements.cfa.address,
      "\ndaix.address: " + daix.address,
      "\nIOTNFTERC20TokenDeployed.address: " + IOTNFTERC20TokenDeployed.address,
      "\nsf.agreements.ida.address: " + sf.agreements.ida.address,
      "\naccounts[0]: " + accounts[0]
    );
    app = await web3tx(IOTNFT.new, "Deploying IOTNFT")(
      IONFTTokenDeployed.address,
      sf.host.address,
      sf.agreements.cfa.address,
      daix.address,
      sf.agreements.ida.address,
      { gas: "5000000", from: accounts[0] }
    );
    console.log("deployed IOTNFT contract: ", app.address);
    receipt = await IONFTTokenDeployed.setContractIOTNFTAddress(app.address);
    console.log("set setContractIOTNFTAddress in nft contract: ", receipt);

    //  await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME);
    // await logUsers();
  });

  async function checkBalance(user) {
    console.log("Balance of ", user.alias);
    console.log("balance DAIx: ", (await daix.balanceOf(user.address)).toString());
  }
  async function checkBalanceAddress(address) {
    console.log("Balance of ", address);
    console.log("DAI: ", (await dai.balanceOf(address)).toString());
  }
  async function checkBalances(accounts) {
    for (let i = 0; i < accounts.length; ++i) {
      await checkBalance(accounts[i]);
    }
  }

  async function checkBalance(user) {
    console.log("Balance of ", user.alias);
    console.log("DAIx: ", (await daix.balanceOf(user.address)).toString());
  }

  async function upgrade(_accounts) {
    for (let i = 0; i < _accounts.length; ++i) {
      await web3tx(daix.upgrade, `${_accounts[i].alias} upgrades many DAIx`)(
        toWad(999000000000),
        { from: _accounts[i].address }
      );
      await checkBalance(_accounts[i]);
    }
  }
  describe("Mint NFT", async function() {
    it("should mint a new token", async () => {
      var tokenPrice = etherConverter(0.01, "eth", "wei");
      var receipt = await web3tx(app.mintToken, `${u[1]} mints new token`)(
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
        true,
        2,
        { gas: "5000000", from: accounts[0] }
      );
      console.log(
        "newTokenMinted: ",
        new bigNumber(receipt.logs[0].tokenId).toFixed(0)
      );
      tokenIds.push(receipt.logs[0].tokenId);
      assert.isTrue(receipt.logs.length > 0);
    });
    it("should check the owner of the token minted ", async () => {
      console.log("token ids: ", tokenIds);
      var owner = await IONFTTokenDeployed.ownerOf(1);
      console.log("owner: ", owner, " minter: ", accounts[0]);
      assert.strictEqual(
        app.address == owner,
        true,
        "Token not delegated to contract"
      );
    });

    it("should buy a token with index 1", async () => {
      var tokenPrice = etherConverter(1, "eth", "wei");
      var token = await web3tx(app.buyToken, `${u[1]} mints new token`)(1, {
        gas: "5000000",
        from: accounts[1],
        value: tokenPrice,
      });
      console.log("token bought: ", token);
      assert.isTrue(token.logs.length > 0);
    });
    it("should check the owner of the token minted bought by account[1]", async () => {
      var owner = await IONFTTokenDeployed.ownerOf(1);
      console.log("owner: ", owner, " minter account[1]: ", accounts[1]);
      assert.strictEqual(accounts[1] == owner, true, "account[1] not owner");
    });
    it("should mint a new token", async () => {
      var tokenPrice = etherConverter(1, "eth", "wei");
      var receipt = await web3tx(app.mintToken, `${u[1]} mints new token`)(
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
        true,
        3,
        { gas: "5000000", from: accounts[0] }
      );
      console.log(
        "newTokenMinted: ",
        new bigNumber(receipt.logs[0].tokenId).toFixed(0)
      );
      tokenIds.push(receipt.logs[0].tokenId);
      assert.isTrue(receipt.logs.length > 0);
    });
    it("should rent an NFT", async () => {
      const { alice } = u;
      await upgrade([alice]);
      await checkBalances([alice, u.admin]);
      await checkBalance(alice)
      const monthlyAmount = toWad(100);
      const calculatedFlowRate = Math.floor(monthlyAmount / 3600 / 24 / 30);
      console.log("calculated flow: ", calculatedFlowRate);
      var approved = await web3tx(dai.approve, `${alice.alias} approves daix`)(
        app.address,
        monthlyAmount,
        {
          from:alice.address,
        }
      );
      console.log("approved daxi: ", approved);
      var rentNFT = await web3tx(app.rentNFT, `${accounts[2]} renting nft`)(
        2,
        1,
        toWad(1).toString(),
        {
          from: alice.address,
          gas: "5000000",
        }
      );
      console.log("rent nft: ", rentNFT);
      assert.isTrue(rentNFT.logs.length > 0);
    });
    it("should check if the flow has started", async function() {
      var balanceBefore = await checkBalanceAddress(accounts[0]);
      await traveler.advanceTimeAndBlock(TEST_TRAVEL_TIME);
      var balanceAfter = await checkBalanceAddress(accounts[0]);
      console.log(
        "balanceBefore: ",
        balanceBefore,
        " balanceAfter: ",
        balanceAfter
      );
      assert.isTrue(balanceAfter >= balanceBefore);
    });
  });
});
