<template>
  <div style="height: 100vh; width: 100%; " fluid>
    <l-map
      :key="mapKey"
      :zoom="zoom"
      :center="center"
      :options="mapOptions"
      style="height:100%;z-index: 1;"
      @update:center="centerUpdate"
      @update:zoom="zoomUpdate"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <l-marker
        v-for="(icon, index) in $store.state.dappNFTs"
        :key="index + Date.now()"
        :lat-lng="[icon.latitude, icon.longitude]"
      >
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
    <NFTDetilsModal />
  </div>
</template>

<script>
import { latLng } from "leaflet";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LIcon,
} from "vue2-leaflet";
import NFTDetilsModal from "../modals/NFTDetilsModal.vue";
import bigNumber from "bignumber.js";

export default {
  name: "Example",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LIcon,
    NFTDetilsModal,
  },
  watch: {
    "$store.state.dappNFTs": function() {
      this.mapKey++;

      console.log("this.ownedNFTs: ", this.ownedNFTs);
    },
  },
  data() {
    return {
      mapKey: 0,
      show: false,
      zoom: 2,
      center: latLng(-85.062508, 25.461502),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(0, 0),
      withTooltip: latLng(0, 0),
      currentZoom: 0,
      currentCenter: latLng(0, 0),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
      ownedNFTs: [],
    };
  },
  computed: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
  },
  mounted() {
    // this.center = this.$store.state.selectedDataPoint.latLong;
    this.withTooltip = this.$store.state.selectedDataPoint.latLong;
    this.currentCenter = this.$store.state.selectedDataPoint.latLong;
    this.withPopup = this.$store.state.selectedDataPoint.latLong;
    let _this = this;
    this.loadData();
  },
  methods: {
    loadData: async function() {
      let _this = this;
      this.ownedNFTs = [];
      this.$store.state.isLoading = true;
      var content = await this.$store.dispatch("getCeramicData");
      /* content.data = [];
      content.leaderboard = [];
      await this.$store.dispatch("saveSkyData", content);*/
      for (var index in content.data) {
        var data = content.data[index];
        if (data.userAddress === _this.$store.state.userAddress) {
          _this.$store.state.userData = data;
        }
        data.data.map((nft) => {
          nft.nfts.map((minted) => {
            _this.$store.state.dappNFTs.push(minted);
          });
        });
      }
      for (
        var indexInner = 0;
        indexInner < _this.$store.state.dappNFTs.length;
        indexInner++
      ) {
        await _this.$store.state.ionftContract.methods
          .getTokenDetails(_this.$store.state.dappNFTs[indexInner].tokenId)
          .call({ from: _this.$store.state.userAddress, gas: 6000000 })
          .then((details, error) => {
            if (details[0] === _this.$store.state.userAddress) {
              _this.$store.state.dappNFTs[indexInner].price = new bigNumber(
                _this.$store.state.etherConverter(details[1], "wei", "eth")
              ).toFixed(7);
              _this.$store.state.dappNFTs[
                indexInner
              ].originalPrice = new bigNumber(
                _this.$store.state.etherConverter(details[2], "wei", "eth")
              ).toFixed(7);
              _this.$store.state.dappNFTs[indexInner].owner = details[0];
              _this.ownedNFTs.push(_this.$store.state.dappNFTs[indexInner]);
            }
          })
          .catch((error) => {
            console.log("error getting token details: ", error);
            delete _this.$store.state.dappNFTs[index];
          });
      }

      if (_this.ownedNFTs.length === 0) {
        this.$store.dispatch("warning", {
          warning: "Seems like you currently dont own any IONFTs",
          onTap: function() {},
        });
      }
      this.$store.state.isLoading = false;
    },
    getRandomInRange(from, to, fixed) {
      return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
      // .toFixed() returns string, so ' * 1' is a trick to convert to number
    },
    showNFTDetailsDialog(icon) {
      console.log("clicked on: ", icon);
      this.$store.state.selectedNFT = icon;
      this.$store.state.showNFTDetailsDialog = true;
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert("Click!");
    },
  },
};
</script>
