<template>
  <!-- App.vue -->
  <v-app>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-navigation-drawer v-model="drawer" absolute bottom temporary app>
      <v-col>
        <v-row justify="center" style="padding-bottom: 30px;">
          <div class="font-weight-black font-italic text-h3">IOTNFT</div>
        </v-row>
        <v-spacer></v-spacer>
        <v-row justify="center" align="center">
          <v-btn
            width="230"
            v-if="
              !$store.state.connected && $store.state.userAddress.length === 0
            "
            @click="connectWallet"
            text
          >
            <v-img
              src="https://siasky.net/EADM1s02BfgR8zJtenrCkBuWs81PuDIkNhYdUsUulTaB4A"
            >
            </v-img>
            Connect
          </v-btn>
          <v-btn
            width="230"
            v-if="$store.state.connected || $store.state.userAddress.length > 0"
            text
          >
           <v-img   contain width="0"
              src="https://siasky.net/GAAER3g7kfmLZF6FoUsbA07MRX9-2ulu5rkvp6CN2sBEcg"
            >
            </v-img>
            {{
              $store.state.userAddress.substring(0, 6) +
                ".." +
                $store.state.userAddress.substring(
                  $store.state.userAddress - 4,
                  $store.state.userAddress.length
                )
            }}
          </v-btn>
        </v-row>
        <v-row
          style="padding-top:20px; padding-bottom:30px;"
          align="center"
          justify="center"
        >
          <v-icon
            color="black"
            style="padding-right:30px; padding-left:20px;"
            right
            dark
          >
            mdi-wallet
          </v-icon>
          <v-col
            ><v-row>Total Earnings</v-row>
            <v-row>{{ $store.state.totalStaked }} IOTEX</v-row></v-col
          >
        </v-row>
        <v-row
          ><v-divider
            style="padding-top:20px;padding-left:40px;padding-right:40px;"
          ></v-divider
        ></v-row>
        <v-row
          style="padding-top:10px; padding-bottom:10px;"
          align="center"
          justify="center"
        >
          <v-btn @click="$router.push('/mintionft')" block plain>
            <v-icon
              color="black"
              style="padding-right:30px; padding-left:20px;"
              right
              dark
            >
              mdi-pen
            </v-icon>
            <v-col><v-row style="color:black">MINT IONNFT</v-row></v-col>
          </v-btn>
        </v-row>
        <v-row
          style="padding-top:10px; padding-bottom:10px;"
          align="center"
          justify="center"
        >
          <v-btn @click="$router.push('/mapview')" block plain>
            <v-icon
              color="black"
              style="padding-right:30px; padding-left:20px;"
              right
              dark
            >
              mdi-map
            </v-icon>
            <v-col><v-row style="color:black">IONFT MAP</v-row></v-col>
          </v-btn>
        </v-row>
        <v-row
          style="padding-top:10px; padding-bottom:10px;"
          align="center"
          justify="center"
        >
          <v-btn @click="$router.push('/leaderboard')" block plain>
            <v-icon
              color="black"
              style="padding-right:30px; padding-left:20px;"
              right
              dark
            >
              mdi-ladder
            </v-icon>
            <v-col><v-row style="color:black">Leaderboard</v-row></v-col>
          </v-btn>
        </v-row>
        <v-row
          style="padding-top:10px; padding-bottom:10px;"
          align="center"
          justify="center"
        >
          <v-btn @click="$router.push('/ownedview')" block plain>
            <v-icon
              color="black"
              style="padding-right:30px; padding-left:20px;"
              right
              dark
            >
              mdi-account-check
            </v-icon>
            <v-col><v-row style="color:black">Owned IONFTS</v-row></v-col>
          </v-btn>
        </v-row>
        <v-row
          style="padding-top:10px; padding-bottom:10px;"
          align="center"
          justify="center"
        >
          <v-btn @click="$router.push('/visualiseview')" block plain>
            <v-icon
              color="black"
              style="padding-right:30px; padding-left:20px;"
              right
              dark
            >
              mdi-map-marker
            </v-icon>
            <v-col><v-row style="color:black">Device Map</v-row></v-col>
          </v-btn>
        </v-row>

        <!--  
        <v-row
          style="padding-top:10px; padding-bottom:30px;"
          align="center"
          justify="center"
        >
          <v-btn @click="goto(4)" block plain>
            <v-icon
              color="black"
              style="padding-right:30px; padding-left:20px;"
              right
              dark
            >
              mdi-newspaper-variant-multiple-outline
            </v-icon>
            <v-col><v-row style="color:black">White Paper</v-row></v-col>
          </v-btn>
        </v-row>-->
        <v-spacer></v-spacer>
        <v-row
          align="center"
          justify="center"
          style="padding-top:10px; padding-bottom:100px;"
          ><v-btn text target="https://twitter.com/brianspha_"
            ><v-icon
              color="black"
              style="padding-right:25px; padding-left:0px;"
            >
              mdi-twitter
            </v-icon></v-btn
          >
        </v-row>
        <v-row
          align="center"
          justify="center"
          style="padding-top:40px; padding-bottom:100px;padding-right:25px; padding-left:0px;"
          >Created By &nbsp;<a href="https://twitter.com/brianspha_"
            >Brianspha</a
          ></v-row
        >
      </v-col>
    </v-navigation-drawer>

    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </v-container>
    </v-main>
    <MintNFTModal />
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
import { latLng } from "leaflet";
import bigNumber from "bignumber.js";
import Web3 from "web3";
import EmbarkJS from "../contracts/embarkArtifacts/embarkjs";
import { icon } from "leaflet";
import MintNFTModal from "./modals/MintNFTModal.vue";

export default {
  name: "App",

  components: { MintNFTModal },
  beforeMount() {
    this.authenticate();
  },
  methods: {
    loadData: async function() {
      let _this = this;
      this.$store.state.ionftContract.methods
        .getMinterDetails(this.$store.state.userAddress)
        .call({ from: this.$store.state.userAddress, gas: 6000000 })
        .then(async (details, error) => {
          console.log("userDetails: ", details);
          _this.$store.state.totalStaked = new bigNumber(
            _this.$store.state.etherConverter(details[0], "wei", "eth")
          ).toFixed(7);
          console.log("totalStaked: ", _this.$store.state.totalStaked);
        })
        .catch((error) => {
          console.log("error getting user details: ", error);
        });
    },
    authenticate() {
      this.$store.state.isLoading = true;
      let _this = this;
      _this.$store.state.ceramicClient.did
        .authenticate()
        .then(async (res, error) => {
          this.init()
            .then(async (res, err) => {
              await _this.loadData();
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
      if (typeof ethereum !== "undefined") {
        try {
          await ethereum.enable();
          this.$store.state.userAddress = window.web3.eth.getDefaultAccount;
          this.$store.state.connected = true;
          console.log("found default account: ", this.$store.state.userAddress);
        } catch (error) {
          this.$store.dispatch("error", {
            error: "There was an error getting enabling metamask",
          });
        }
      } else {
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
          this.$router.push("/");
        } else {
          console.info("This page is not reloaded");
        }
        EmbarkJS.onReady(async (error) => {
          var accounts = await require("../contracts/embarkArtifacts/embarkjs").default.enableEthereum();
          console.log("accounts; ", accounts);
          this.$store.state.userAddress = accounts[0];
          this.$store.state.connected = true;
          resolve(true);
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
          window.web3.eth.net.getId((err, netId) => {
            console.log("netId: ", netId);
            switch (netId.toString()) {
              case "4690":
                this.$store.state.connected = true;
                break;
              default:
                window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x1252",
                      chainName: "Local Ganache Node",
                      nativeCurrency: {
                        name: "Locahost",
                        symbol: "Localhost",
                        decimals: 18,
                      },
                      rpcUrls: ["https://localhost:8546"],
                      blockExplorerUrls: ["https://localhost:8546/"],
                    },
                  ],
                });
                break; /* */
            }
          });
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
