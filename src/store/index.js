require("dotenv").config();

import Vue from "vue";
import Vuex from "vuex";
import swal from "sweetalert2";
import createPersistedState from "vuex-persistedstate";
import { SkynetClient, genKeyPairFromSeed } from "skynet-js";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { randomBytes } from "@stablelib/random";
import CeramicClient from "@ceramicnetwork/http-client";
import KeyDidResolver from "key-did-resolver";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import { DID } from "dids";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import Web3 from 'web3'
import detectEthereumProvider from "@metamask/detect-provider";
const bigNumber = require("bignumber.js");
import {
  createNewClient,
  getAllPebbles,
  getThread,
  updatePebble,
  createEntity,
  setup
} from "../textile/textile"
const resolver = {
  ...KeyDidResolver.getResolver(),
  ...ThreeIdResolver.getResolver(ceramic),
};
const did = new DID({ resolver });
const { publicKey, privateKey } = genKeyPairFromSeed(
  process.env.VUE_APP_APP_SECRET
);

const seed = new Uint8Array(process.env.VUE_APP_SEED.split(","));
const ceremicProvider = new Ed25519Provider(seed);
let ceramic = new CeramicClient(process.env.VUE_APP_CEREMIC_NODE_URL);
ceramic.did = did;
ceramic.did.setProvider(ceremicProvider);
const ApolloClient = require("apollo-client").ApolloClient;
const createHttpLink = require("apollo-link-http").createHttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const crossFetch = require("cross-fetch").default;
const gql = require("graphql-tag").default;
Vue.use(Vuex);
const client = new SkynetClient("https://siasky.net/");

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    //sampleLocationData: require("../data/location.json"),
    showMyLocationsOnly: false,
    totalStaked: 0,
    tokenContract: require("../../contracts/embarkArtifacts/contracts/TokenContract")
      .default,
    ionftContract: require("../../contracts/embarkArtifacts/contracts/IOTNFT")
      .default,
    loadinZIndex: 500,
    mintNFTDialog: false,
    testIMEI: process.env.VUE_APP_DEVICE_IMEI,
    userData: {
      imeis: [],
      data: [],
    },
    ceramicClient: ceramic,
    ceremicProvider: ceremicProvider,
    graphClient: new ApolloClient({
      link: createHttpLink({
        uri: process.env.VUE_APP_TRUSTREAM_SUBGRAPH,
        fetch: crossFetch,
        cache: new InMemoryCache(),
      }),
      cache: new InMemoryCache(),
    }),
    device_telemetry_query: gql`
    {
      deviceRecords(where: { imei:"${process.env.VUE_APP_DEVICE_IMEI}"}) {
        raw # !! Protobuf encoded sensors values
        imei
        signature
      }
    }
    `,
    true_stream_sub_graph: process.env.VUE_APP_TRUSTREAM_SUBGRAPH,
    appSecret: process.env.VUE_APP_APP_SECRET,
    skyClient: client,
    privateKey: privateKey,
    publicKey: publicKey,
    etherConverter: require("ether-converter"),
    utils: require("web3-utils"),
    showNFTDetailsDialog: false,
    selectedDataPoint: {},
    data: [],
    isLoading: false,
    userAddress: "",
    primaryColor: "green darken-1",
    secondaryColor: "#699c79",
    selectedNFT: {},
    streamId: process.env.VUE_APP_CEREMIC_SECRET,
    tile: {},
    dappNFTs: [],
    deviceDetailsDialog: false,
    selectedDevice: {},
    revision: 1,
    connected: false,
    allDAppNFTs: [],
    deviceData: [],
  },
  plugins: [createPersistedState()],
  modules: {},
  actions: {
    connectWallet: async function () {
      store.state.isLoading = true;
      const provider = await detectEthereumProvider();
      console.log("provider: ", provider);
      if (provider) {
        try {
          var web3Instance = new Web3(window.web3.currentProvider);
          window.web3 = web3Instance;
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          console.log("window.web3.eth.getDefaultAccount: ", accounts);
          window.web3.eth.defaultAccount = accounts[0];
          store.state.userAddress = window.web3.eth.defaultAccount;
          console.log("found default account: ", store.state.userAddress);
          store.state.isLoading = false;
          store.state.connected = true;
          await store.dispatch("getUserDevices");
        } catch (error) {
          console.log("error connectin wallet: ", error);
          store.state.isLoading = false;
          store.dispatch("error", {
            error: "There was an error enabling metamask",
          });
        }
      } else {
        store.state.isLoading = false;
        store.dispatch(
          "errorWithFooterExtension", {
            errorTitle:"Mising Extension",

          message: "Seems like you dont have metamask installed please use the below link to download",
          footer: `<a href= https://metamask.io> Download Metamask</a>`
        }
        );
      }
    },
    getUserDevices: async function () {
      store.state.isLoading = true;
      const axios = require("axios").default;
      var data = JSON.stringify({
        operationName: "getDevices",
        variables: {},
        query: `query getDevices {\n  pebble_device(limit: 10, where: {owner: {_eq: "${store.state.userAddress}"}}) {\n    id\n    owner\n  }\n}\n`,
      });
      axios({
        method: "post",
        url: process.env.VUE_APP_APP_GRAPHQL_URL_DEV,
        data: data,
      })
        .then(async (devices) => {
          console.log("devices: ", devices);
          if (
            Object.prototype.hasOwnProperty.call(devices.data, "error") ||
            devices.data.data.pebble_device.length === 0
          ) {
            console.log("no devices found for this user");
            //  this.$store.state.userData.imeis=["100000000000225", "100000000000211"]
          } else {
            console.log("found user device: ", devices.data.data.pebble_device);
            store.state.userData.imeis = devices.data.data.pebble_device.map(
              (device) => {
                return device.id;
              }
            );
          }
        })
        .catch((error) => {
          console.log("error getting user registred devices: ", error);
          store.state.isLoading = false;
        });
    },
    getTextileData: async function () {
      var pebbles = await getAllPebbles()
      console.log("pebbles: ",pebbles)
      return pebbles[0]
    },
    saveTextileData: async function (context, data) {
      console.log("saving textile data: ", data);
      await updatePebble([data])
    },
    createNewTextTileData: async function (context, data) {
      var createdData = await createEntity(data)
      return true
    },
    loadData: async function() {
      console.log("fetching data");
      store.state.dappNFTs = [];
      store.state.isLoading = true;
      var content = await store.dispatch("getTextileData");
  /*   console.log("contentcontentcontentcontentcontent: ",content)
         content.data = [];
         content.leaderboard = [];
         content._id = content.data._id
         await store.dispatch("saveTextileData", content);
          */
         console.log("foundData: ", content.data);
      for (var index in content.data) {
        var data = content.data[index];
        if (
          data.userAddress.toUpperCase() ===
          store.state.userAddress.toUpperCase()
        ) {
          store.state.userData = data;
        }
        data.data.map((nft) => {
          nft.nfts.map((minted) => {
            console.log("dappNFTs: ", minted);
            store.state.dappNFTs.push(minted);
          });
        });
      }
      for (
        var indexInner = 0;
        indexInner < store.state.dappNFTs.length;
        indexInner++
      ) {
        await store.state.ionftContract.methods
          .getTokenDetails(store.state.dappNFTs[indexInner].tokenId)
          .call({ from: store.state.userAddress, gas: 6000000 })
          .then((details, error) => {
            store.state.dappNFTs[indexInner].price = new bigNumber(
              store.state.etherConverter(details[1], "wei", "eth")
            ).toFixed(7);
            store.state.dappNFTs[indexInner].originalPrice = new bigNumber(
              store.state.etherConverter(details[2], "wei", "eth")
            ).toFixed(7);
            store.state.dappNFTs[indexInner].owner = details[0];
            store.state.dappNFTs[indexInner].isDelegated = details[4];
          })
          .catch((error) => {
            console.log("error getting token details: ", error);
            delete store.state.dappNFTs[index];
          });
      }

      /*  if (store.state.dappNFTs.length === 0) {
        store.dispatch("warning", {
          warning: "Seems like arent any listed IONFTs",
          onTap: function() {},
        });
      }*/
      console.log("dappNFTs: ", store.state.dappNFTs);
      store.state.deviceData = store.state.dappNFTs;
      store.state.allDAppNFTs = store.state.dappNFTs;
      store.state.isLoading = false;
    },
    getCeramicData: async function() {
      const tileDocument = await TileDocument.load(
        ceramic,
        this.state.streamId
      );
      store.state.tile = tileDocument;
      return tileDocument.content;
    },
    saveCeramicData: async function(context, data) {
      console.log("saving ceremic data: ", data);
      const doc = await TileDocument.load(
        this.state.ceramicClient,
        this.state.streamId
      );
      await doc.update(
        data,
        {},
        {
          controllers: [this.state.ceramicClient.did.id],
        }
      );
    },
    getSkyData: async function() {
      var test = await this.state.skyClient.db.getJSON(
        this.state.publicKey,
        this.state.appSecret
      );
      if (test.data === null) {
        test = {
          data: [],
          leaderboard: [],
        };
      }
      return test;
    },
    saveSkyData: async function(context, data) {
      const results = await client.db.setJSON(
        this.state.privateKey,
        this.state.appSecret,
        data
      );
    },
    success(context, message) {
      swal.fire({
        position: "top-end",
        icon: "success",
        title: "Success",
        showConfirmButton: false,
        timer: 2500,
        text: message,
      });
    },
    warning(context, message) {
      swal.fire({
        icon: "info",
        title: "Info",
        text: message.warning,
        denyButtonText: `Close`,
      });
    },
    error(context, message) {
      swal.fire("Error!", message.error, "error").then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          message.onTap()
        }
      });
    },
    successWithFooter(context, message) {
      swal.fire({
        icon: "success",
        title: "Success",
        text: message.message,
        footer: `<a href= https://testnet.iotexscan.io/tx/${message.txHash}> View on iotex Explorer</a>`,
      });
    },
    errorWithFooterMetamask(context, message) {
      swal.fire({
        icon: "error",
        title: "Error!",
        text: message,
        footer: `<a href= https://metamask.io> Download Metamask</a>`,
      });
    },
    errorWithFooterExtension(context, message) {
      swal.fire({
        icon: "error",
        title: message.errorTitle,
        text: message.message,
        footer: message.footer,
      }).then((result) => {
        window.location.reload()
      });
    }
  },
});

export default store;
