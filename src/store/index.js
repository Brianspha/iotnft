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
const bigNumber = require("bignumber.js");
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
  },
  plugins: [createPersistedState()],
  modules: {},
  actions: {
    loadData: async function() {
      console.log("fetching data");
      store.state.dappNFTs = [];
      store.state.isLoading = true;
      var content = await store.dispatch("getCeramicData");
      /*  content.data = [];
      content.leaderboard = [];
      await store.dispatch("saveCeramicData", content);*/
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

      if (store.state.dappNFTs.length === 0) {
        store.dispatch("warning", {
          warning: "Seems like arent any listed IONFTs",
          onTap: function() {},
        });
      }
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
        }
      });
    },
    successWithFooter(context, message) {
      swal.fire({
        icon: "success",
        title: "Success",
        text: message.message,
        footer: `<a href= https://testnet.bscscan.com/tx/${message.txHash}> View on Binance Explorer</a>`,
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
  },
});

export default store;
