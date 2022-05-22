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
    chainId: async function(chainId) {
      if (chainId !== 80001) {
        await this.switchNetworks();
      }
    },
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
                  chainId: "0x13881",
                  chainName: "Polygon Testnet",
                  nativeCurrency: {
                    name: "Matic",
                    symbol: "Matic",
                    decimals: 18,
                  },
                  rpcUrls: ["wss://ws-matic-mumbai.chainstacklabs.com"],
                  blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
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
      this.init();
      //this.$store.state.isLoading = false;
    },
    detectPageReload() {
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
    },
    isMetaMaskConnected() {
      //Have to check the ethereum binding on the window object to see if it's installed
      const { ethereum } = window;
      return Boolean(ethereum && ethereum.isMetaMask);
    },
    switchNetworks: async function() {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }],
        });
      } catch (addError) {
        console.log(addError);
        if (addError.code === 4001) {
          this.$store.dispatch("error", {
            error: "The DApp only works on the Polygon Mumbai Testnetwork",
            onTap: async () => {
              window.location.reload()
            },
          });
        }
      }
    },
    init: async function() {
      return new Promise(async (resolve) => {
        this.$store.state.isLoading = true;
        let _this = this;
        this.detectPageReload();
        await this.$store.dispatch("connectWallet");
        console.log("window: ", window.web3);
        window.ethereum.on("accountsChanged", function(accounts) {
          _this.$store.state.userAddress = accounts[0];
          window.location.reload();
        });
        this.chainId = await web3.eth.getChainId();
        console.log("chainId: ", this.chainId);
        /* */
        window.ethereum.on("chainChanged", (chainId) => {
          console.log("chainChanged: ", chainId);
          if (chainId !== "0x13881" || chainId !== "0x13881") {
            this.$store.dispatch("error", {
              error: "The DApp only works on the Polygon Mumbai Testnetwork",
              onTap: async () => {
                await this.switchNetworks();
              },
            });
          } else {
            window.location.reload();
          } /* */
          // Handle the new chain.
          // Correctly handling chain changes can be complicated.
          // We recommend reloading the page unless you have good reason not to.
        });
        await this.$store.dispatch("loadData");
        //this.$store.state.isLoading = false;
      });
    },
  },
  data: () => ({
    drawer: false,
    chainId: 0,
  }),
};
</script>
