<template>
  <!-- App.vue -->
  <!-- App.vue -->

  <v-app>
    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-overlay
      :z-index="$store.state.loadinZIndex"
      :value="$store.state.isLoading"
    >
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-footer app>
      <!-- -->
    </v-footer>
  </v-app>
</template>
<script>
import Web3 from "web3";
import EmbarkJS from "../contracts/embarkArtifacts/embarkjs";
import MintNFTModal from "./modals/MintNFTModal.vue";

export default {
  name: "App",
  watch: {
    "window.ethereum.networkVersion": function(networkId) {
      console.log("networkId: ", networkId);
      switch (networkId.toString()) {
        case "4690":
          this.$store.state.connected = true;
          break;
        default:
          if (!this.$store.state.connected) {
            window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x1252",
                  chainName: "IOTEXT Testnet",
                  nativeCurrency: {
                    name: "IOTEXT",
                    symbol: "IOTX",
                    decimals: 18,
                  },
                  rpcUrls: ["https://babel-api.testnet.iotex.io"],
                  blockExplorerUrls: ["https://testnet.iotexscan.io/"],
                },
              ],
            });
          }
          break; /*;*/
      }
    },
    "$store.state.selectedNFT.userAddress": async function(val) {
      if (val) {
      }
    },
    "$store.state.connected": async function(val) {
      console.log("$store.state.connected changed value: ", val);
      if (val) {
        await this.$store.dispatch("getUserDevices");
        await this.$store.dispatch("loadData");
      }
    },
  },
  components: { MintNFTModal },
  created() {
    this.authenticate();
  },
  mounted() {
    /* this.$store.dispatch("warning", {
      warning: "Please note the website is still under development",
    });*/
  },
  methods: {
    authenticate() {
      this.$store.state.isLoading = true;
      let _this = this;
      _this.$store.state.ceramicClient.did
        .authenticate()
        .then(async (res, error) => {
          this.init()
            .then(async (res, err) => {
              _this.$store.state.isLoading = false;
            })
            .catch((error) => {
              _this.$store.state.isLoading = false;
            });
        });
    },
    getRandomInRange(from, to, fixed) {
      return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
      // .toFixed() returns string, so ' * 1' is a trick to convert to number
    },
    connectWallet: async function() {
      this.$store.state.isLoading = true;
      if (typeof ethereum !== "undefined") {
        try {
          await ethereum.enable();
          this.$store.state.userAddress = window.web3.eth.getDefaultAccount;
          this.$store.state.connected = true;
          console.log("found default account: ", this.$store.state.userAddress);
        } catch (error) {
          this.$store.state.isLoading = false;
          this.$store.dispatch("error", {
            error: "There was an error getting enabling metamask",
          });
        }
      } else {
        this.$store.state.isLoading = false;
        this.$store.dispatch(
          "errorWithFooterMetamask",
          "Seems like you dont have metamask installed please use the below link to download"
        );
      }
    },
    init: async function() {
      return new Promise(async (resolve) => {
        let _this = this;
        if (window.performance) {
          console.info("window.performance works fine on this browser");
        }
        console.info(performance.navigation.type);
        if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
          console.info("This page is reloaded");
          window.location.href = "./index.html";
        } else {
          console.info("This page is not reloaded");
        }
        EmbarkJS.onReady(async (error) => {
          var accounts = await require("../contracts/embarkArtifacts/embarkjs").default.enableEthereum();
          console.log("accounts; ", accounts);
          this.$store.state.userAddress = accounts[0];
          this.$store.state.connected = true;

          if (typeof ethereum !== "undefined") {
            // Supports EIP-1102 injected Ethereum providers.
            window.web3 = new Web3(ethereum);
            console.log("in 1st if");
          } else if (typeof web3 !== "undefined") {
            console.log("in 2nd if");
            // Supports legacy injected Ethereum providers.
            window.web3 = new Web3(web3.currentProvider);
          } else {
            // Your preferred fallback.
            console.log("in 3rd if");
            window.web3 = new Web3(
              new Web3.providers.HttpProvider("http://localhost:8546")
            );
          }
          window.ethereum.on("accountsChanged", function(accounts) {
            _this.$store.state.userAddress = accounts[0];
            window.location.reload();
          });
          window.ethereum.on("networkChanged", function(netId) {
            _this.$store.state.userAddress = accounts[0];
            window.location.reload();
          });
        });
      });
    },
  },
  data: () => ({
    drawer: false,
  }),
};
</script>
