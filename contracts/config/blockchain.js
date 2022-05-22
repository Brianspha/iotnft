// This file contains only the basic configuration you need to run Embark's node
// For additional configurations, see: https://framework.embarklabs.io/docs/blockchain_configuration.html
require("dotenv").config();
module.exports = {
  // default applies to all environments
  default: {
    enabled: true,
    client: "geth", // Can be ganache-cli, geth or parity (default: geth)
  },

  development: {
    client: "ganache-cli",
    clientConfig: {
      miningMode: "dev", // Mode in which the node mines. Options: dev, auto, always, off
    },
  },

  privatenet: {
    // Accounts to use as node accounts
    // The order here corresponds to the order of `web3.eth.getAccounts`, so the first one is the `defaultAccount`
    // For more account configurations, see: https://framework.embarklabs.io/docs/blockchain_accounts_configuration.html
    accounts: [
      {
        nodeAccounts: true, // Accounts use for the node
        numAddresses: "1", // Number of addresses/accounts (defaults to 1)
        password: "config/development/password", // Password file for the accounts
      },
    ],
    clientConfig: {
      datadir: ".embark/privatenet/datadir", // Data directory for the databases and keystore
      miningMode: "auto",
      genesisBlock: "config/privatenet/genesis.json", // Genesis block to initiate on first creation of a development node
    },
  },

  privateparitynet: {
    client: "parity",
    genesisBlock: "config/privatenet/genesis-parity.json",
    datadir: ".embark/privatenet/datadir",
    miningMode: "off",
  },
  iotex: {
    endpoint: process.env.NODE_URL_IOTEX, // Endpoint of an node to connect to. Can be on localhost or on the internet
    accounts: [
      {
        privateKey: process.env.IOTEX_ACCOUNT_KEY,
      },
    ],
  },
  ropsten: {
    endpoint: process.env.NODE_URL, // Endpoint of an node to connect to. Can be on localhost or on the internet
    accounts: [
      {
        privateKey: process.env.IOTEX_ACCOUNT_KEY,
      },
    ],
  },
  matic: {
    endpoint: process.env.NODE_URL_POLYGON, // Endpoint of an node to connect to. Can be on localhost or on the internet
    accounts: [
      {
        privateKey: process.env.IOTEX_ACCOUNT_KEY,
      },
    ],
  },
  meter: {
    endpoint: process.env.NODE_URL_POLYGON, // Endpoint of an node to connect to. Can be on localhost or on the internet
    accounts: [
      {
        privateKey: process.env.IOTEX_ACCOUNT_KEY,
      },
    ],
  },
  development: {
    endpoint: "http://127.0.0.1:8546", // Endpoint of an node to connect to. Can be on localhost or on the internet
    accounts: [
      //  {
      //     mnemonic: "myth like bonus scare over problem client lizard pioneer submit female collect",
      //    hdpath: "m/44'/60'/0'/0/"
      //  }
    ],
  },
  harmony: {
    endpoint: process.env.NODE_URL_HARMONY, // Endpoint of an node to connect to. Can be on localhost or on the internet
    accounts: [{ privateKey: `${process.env.IOTEX_ACCOUNT_KEY}` }],
  },
  testnet: {
    networkType: "testnet", // Can be: testnet(ropsten), rinkeby, livenet or custom, in which case, it will use the specified networkId
    syncMode: "light",
    accounts: [
      {
        nodeAccounts: true,
        password: "config/testnet/password",
      },
    ],
  },

  livenet: {
    networkType: "livenet",
    syncMode: "light",
    accounts: [
      {
        nodeAccounts: true,
        password: "config/livenet/password",
      },
    ],
  },

  // you can name an environment with specific settings and then specify with
  // "embark run custom_name" or "embark blockchain custom_name"
  //custom_name: {
  //}
};
