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
console.log("process.env.VUE_APP_TRUSTREAM_SUBGRAPH: ",process.env.VUE_APP_TRUSTREAM_SUBGRAPH)
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
const pebble = `
syntax = "proto2";
message SensorData
{
 optional uint32 snr = 1;
 optional uint32 vbat = 2;
 optional uint32 latitude = 3;
 optional uint32 longitude = 4;
 optional uint32 gasResistance = 5;
 optional uint32 temperature = 6;
 optional uint32 pressure = 7;
 optional uint32 humidity = 8;
 optional uint32 light = 9;
 optional uint32 temperature2 = 10;
 repeated sint32 gyroscope = 11;
 repeated sint32 accelerometer = 12;
 optional string random = 13;
}
message SensorConfig
{
    optional uint32 bulkUpload = 1;
    optional uint32 dataChannel = 2;
    optional uint32 uploadPeriod = 3;
    optional uint32 bulkUploadSamplingCnt = 4;
    optional uint32 bulkUploadSamplingFreq = 5;
    optional uint32 beep = 6;
    optional string firmware = 7; 
}
message SensorState
{
    optional uint32 state = 1;
}
message SensorConfirm {
    optional string owner = 1;
}
message BinPackage
{
    enum PackageType {
        DATA = 0;
        CONFIG = 1;
        STATE = 2;
    }
    required PackageType type = 1;
    required bytes data = 2;
    required uint32 timestamp = 3;
    required bytes signature = 4;
}
message ConfirmPackage {
    required bytes owner = 1;
    required uint32 timestamp = 2;
    required bytes signature = 3;
    required uint32 channel = 4;
}
`;
/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    totalStaked: 0,
    ionftContract: require("../../contracts/embarkArtifacts/contracts/IOTNFT")
      .default,
    loadinZIndex: 500,
    mintNFTDialog: false,
    testIMEI: process.env.VUE_APP_DEVICE_IMEI,
    userData: null,
    ceramicClient: ceramic,
    ceremicProvider: ceremicProvider,
    pebble: pebble,
    graphClient: new ApolloClient({
      link: createHttpLink({
        uri: "http://34.146.117.200:8000/subgraphs/name/iotex/pebble-subgraph",
        fetch: crossFetch,
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
    selectedNFT: {},
    streamId: process.env.VUE_APP_CEREMIC_SECRET,
    tile: {},
    dappNFTs: [],
    deviceDetailsDialog:false,
    selectedDevice:{},
    revision:1
  },
  plugins: [createPersistedState()],
  modules: {},
  actions: {
    getCeramicData: async function() {
      const tileDocument = await TileDocument.load(
        ceramic,
        this.state.streamId
      );
      store.state.tile = tileDocument;
      return tileDocument.content;
    },
    saveCeramicData: async function(context, data) {
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
      if(test.data === null){
        test = {
          data:[],
          leaderboard:[]
        }
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
      swal
        .fire({
          icon: "info",
          title: "Info",
          text: message.warning,
          denyButtonText: `Close`,
        })
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
