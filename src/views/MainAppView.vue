<template>
  <v-container fluid>
    <v-row class="headingRow"
      ><div class="font-weight-black font-italic text-h3">
        <a href="/index.html">IOTNFT</a>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        style="
          background-color:#6bdcc6;color:
            white;border-radius: 5px;
            font-style: italic;
            border-color: #699c79;
            border-width: 1px;
            font-family:cursive;
            font-weight:bold;
            color:white;
        "
        outlined
        href="/index.html"
        >Home</v-btn
      >
      <div style="padding-right:1.5%;"></div>
    </v-row>
    <v-row>
      <div
        class="font-italic"
        style="font-family:cursive; font-size:19px; font-weight:bold; color:rgb(82, 78, 78);"
      >
        <span style="color: #ff0080">Visit</span> your favourite locations ,
        <span style="color: #68b37e">mint </span>your GPS positions,<span
          style="color: #19813a"
          >sell</span
        >
        it on the map!
      </div>
    </v-row>

    <v-row style="padding-top:2%;"
      ><div
        class="font-italic"
        style="
            font-size: 25px;
            font-family:cursive;
            color:rgb(82, 78, 78);
        "
      >
        On Sale:
      </div></v-row
    >
    <v-row style="padding-top:1%;padding-bottom:1%;">
      <div style="padding-left: .4%;"></div>
      <v-divider></v-divider>
      <div style="padding-right: .9%;"></div>
    </v-row>
    <div
      style="
        height: 600px;
        width: 100%;
        padding-top:2%; border-radius: 25px;
        border-color: #699c79; border-width: 5px;
        padding-bottom:5%;
        "
      fluid
    >
      <l-map
        :bounds="bounds"
        :max-bounds="maxBounds"
        :key="mapKey"
        :center="center"
        :options="mapOptions"
        style="
            height: 600px;
            width: 100%;
            z-index: 1;
            border-radius: 25px;
            border-color: #699c79;
            border-width: 2px;
            border: 1px solid #699c79;
            outline: 2px solid #699c79;
        "
        @update:center="centerUpdate"
        @update:zoom="zoomUpdate"
      >
        <l-tile-layer :url="url" :attribution="attribution" />
        <l-marker
          v-for="(icon, index) in $store.state.dappNFTs"
          :key="index"
          :lat-lng="[icon.latitude, icon.longitude]"
        >
          <l-icon
            v-if="icon.isNFT"
            :icon-size="dynamicSize"
            :icon-anchor="dynamicAnchor"
            icon-url="https://siasky.net/CAAfxZScKN7nEA0y7y_EpI4-7Tmk-z16K-Fpg1KdRPoJyQ"
          />
          <l-icon
            v-else
            :icon-size="dynamicSize"
            :icon-anchor="dynamicAnchor"
            icon-url="https://siasky.net/EABuuwOz9W7LmD8TaFQUOj8LQGXddhQbwtnypIVDxvheJw"
          />
          <l-tooltip :options="{ permanent: true, interactive: true }">
            <div>
              {{ icon.name }}
            </div>
            <div
              class="text-decoration-underline"
              @click="showNFTDetailsDialog(icon)"
            >
              View Details
            </div>
          </l-tooltip>
        </l-marker>
      </l-map>
    </div>
    <v-row style="padding-top: 5%;" align="center">
      <div style="padding-left:1%;"></div>
      <div
        v-if="$store.state.connected"
        style="
                font-family:cursive;
                font-style: italic;
                padding-right:1%;
                font-weight:bold;
              "
      >
        {{
          $store.state.userAddress.substring(0, 5) +
            "...." +
            $store.state.userAddress.substring(
              $store.state.userAddress.length - 4,
              $store.state.userAddress.length
            )
        }}
      </div>
      <v-btn
        v-if="$store.state.connected"
        style="
            background-color:#6bdcc6;color:
            white;border-radius: 5px;
            font-style: italic;
            border-color: #699c79;
            border-width: 1px;
            font-family:cursive;
            font-weight:bold;
            color:white;

        "
        outlined
        disabled
        >Connected Wallet</v-btn
      >
      <v-btn
        v-else
        style="
            background-color:#6bdcc6;color:
            white;border-radius: 5px;
            font-style: italic;
            border-color: #699c79;
            border-width: 1px;
            font-family:cursive;
            font-weight:bold;
            color:white;

        "
        outlined
        @click="connectWallet()"
        >Connect Wallet</v-btn
      >
      <v-spacer></v-spacer>
      <v-switch
        color="#699c79"
        inset
        :value="$store.state.showMyLocationsOnly"
        v-model="$store.state.showMyLocationsOnly"
        label="Show my locations only"
      ></v-switch>
    </v-row>
    <v-row style="padding-top:2%;padding-bottom:2%;"
      ><div
        class="font-italic"
        style="
            font-size: 25px;
            font-family:cursive;
            color:rgb(82, 78, 78);
            padding-left:1%;
        "
      >
        On Sale:
      </div></v-row
    >
    <v-divider style="padding-bottom:2%;"></v-divider>
    <device-data></device-data>
    <MintNFTModal />
    <NFTDetilsModal />
    <DeviceDetailsModal />
  </v-container>
</template>

<script>
import { latLngBounds, latLng } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LIcon,
} from "vue2-leaflet";
import DeviceData from "./DeviceData.vue";
import MintNFTModal from "../modals/MintNFTModal.vue";
import NFTDetilsModal from "../modals/NFTDetilsModal.vue";
import DeviceDetailsModal from "../modals/DeviceDetailsModal.vue";
export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LIcon,
    DeviceData,
    MintNFTModal,
    NFTDetilsModal,
    DeviceDetailsModal,
  },
  watch: {
    "$store.state.showMyLocationsOnly": function(val) {
      console.log("changed value: ", val);
    },
  },
  computed: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
  },
  data() {
    return {
      mapKey: 0,
      show: false,
      zoom: 3,
      center: latLng(8.7832, 34.5085),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(-85.062508, 25.461502),
      withTooltip: latLng(-85.062508, 25.461502),
      currentZoom: 0,
      currentCenter: latLng(-85.062508, 25.461502),
      showParagraph: false,
      mapOptions: {
        minZoom: "2.5",
        maxZoom: "20",
        zoomSnap: "0.15",
        zoomDelta: "0.15",
      },
      bounds: latLngBounds([
        [-90, -180],
        [90, 180],
      ]),
      maxBounds: latLngBounds([
        [-90, -180],
        [90, 180],
      ]),
      showMap: true,
      iconSize: 34,
    };
  },
  created() {
    this.$store.dispatch("loadData");
  },
  methods: {
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
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showNFTDetailsDialog(icon) {
      console.log("clicked on: ", icon);
      this.$store.state.isLoading = true;
      if (icon.isNFT) {
        var etherConverter = require("ether-converter");
        icon.price = etherConverter(
          icon.price,
          "wei",
          "eth"
        );
        this.$store.state.selectedNFT = icon;
        this.$store.state.showNFTDetailsDialog = true;
        this.$store.state.isLoading = false;
      } else {
        this.$store.state.selectedDevice = icon;
        this.$store.state.deviceDetailsDialog = true;
        this.$store.state.isLoading = false;
      }
    },
  },
};
</script>

<style>
.text-h3 {
  font-size: 72px;
  background: -webkit-linear-gradient(#97bdcb, #cedddd, #7d9bdb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.headingRow {
  padding-bottom: 2%;
}
.v-label.theme--light {
  font-style: italic;
  font-family: cursive;
  font-weight: bold;
}
</style>
