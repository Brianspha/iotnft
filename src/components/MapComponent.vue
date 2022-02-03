<template>
  <v-row justify="center">
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
          v-for="(icon, index) in mapData"
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
            :icon-url="nonNFTIcon"
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
    <device-details-modal />
    <NFTDetilsModal />
  </v-row>
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
import DeviceDetailsModal from "../modals/DeviceDetailsModal.vue";
import NFTDetilsModal from "../modals/NFTDetilsModal.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LIcon,
    DeviceDetailsModal,
    NFTDetilsModal,
  },
  computed: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
  },
  props: ["mapData", "nonNFTIcon"],
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
  mounted() {
    console.log(
      "mapData: ",
      this.$props.mapData,
      " nonNFTIcon: ",
      this.$props.nonNFTIcon
    );
    this.$store.dispatch("warning", {
      warning: "Some Locations maybe overlapped please zoom in to get a better view",
      onTap: function() {},
    });
  },
  methods: {
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

<style></style>
