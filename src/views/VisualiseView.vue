<template>
  <v-container fluid>
    <v-row class="mb-6" no-gutters>
      <v-col>
        <v-text-field
          :color="$store.state.primaryColor"
          maxlength="15"
          type="number"
          v-model="deviceIMEI"
          label="IMEI"
          hint="Device IMEI e.g. 000000000000000"
        ></v-text-field
      ></v-col>
    </v-row>
    <v-row style="padding-bottom:30px;" align="center" justify="center">
      <v-btn
        class="ma-2"
        width="300"
        v-if="deviceIMEI && deviceIMEI.length == 15"
        color="green"
        text
        @click="getGraphData"
      >
        Get Data
      </v-btn></v-row
    >
    <v-row>
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
            v-for="(icon, index) in deviceLocations"
            :key="index"
            :lat-lng="[icon.latitude, icon.longitude]"
          >
            <l-tooltip :options="{ permanent: true, interactive: true }">
              <div>
                {{ icon.name }}
              </div>
              <div
                class="text-decoration-underline"
                @click="showDeviceDetails(icon)"
              >
                View Details
              </div>
            </l-tooltip>
          </l-marker>
        </l-map>
      </div></v-row
    >
    <DeviceDetailsModal />
  </v-container>
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
import bigNumber from "bignumber.js";
import DeviceDetailsModal from "../modals/DeviceDetailsModal.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
    LIcon,
    DeviceDetailsModal,
  },
  data() {
    return {
      deviceIMEI: "",
      mapKey: 0,
      show: false,
      zoom: 2,
      center: latLng(-85.062508, 25.461502),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: latLng(-85.062508, 25.461502),
      withTooltip: latLng(-85.062508, 25.461502),
      currentZoom: 0,
      currentCenter: latLng(-85.062508, 25.461502),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
      },
      showMap: true,
      deviceLocations: [],
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
  methods: {
    getRandomInRange(from, to, fixed) {
      return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
      // .toFixed() returns string, so ' * 1' is a trick to convert to number
    },
    getGraphData: async function() {
      let _this = this;
      _this.$store.state.isLoading = true;
      const axios = require("axios").default;
                const moment = require("moment");
      axios({
        method: "post",
        url: process.env.VUE_APP_TRUSTREAM_SUBGRAPH,
        data: JSON.stringify({
          imei: this.deviceIMEI,
        }),
        headers: {
          // Overwrite Axios's automatically set Content-Type
          "Content-Type": "application/json; charset=utf-8",
        },
      })
        .then(async (queryResult) => {
          console.log(queryResult.data.data.deviceRecords);
          var deviceData = [];
          for (var index in queryResult.data.data.deviceRecords) {
            const dataPoint = queryResult.data.data.deviceRecords[index];
            const protobuf = require("protobufjs");
            // Load the protobuf definition, it's on GitHub at
            // https://github.com/iotexproject/iott-dapp-example/blob/main/service/proto/pebble.proto
            const pebbleProtoDef = await protobuf.parse(
              this.$store.state.pebble
            ).root;
            // We need the SensorData proto definition, let's import it
            const SensorData = pebbleProtoDef.lookupType("SensorData");
            // Decode the telemetry
            const encodedTelemetry = dataPoint.raw.replace(/0x/g, "");
            var point = SensorData.decode(Buffer.from(encodedTelemetry, "hex"));
            console.log(
              "point in telemtry: ",
              JSON.stringify(point),
              encodedTelemetry
            );
            var lat = new bigNumber(point.latitude).dividedBy(new bigNumber(10).pow(7)).toFixed(3);
            var long = new bigNumber(point.longitude).dividedBy(new bigNumber(10).pow(7)).toFixed(3);
             deviceData.push({
              owner: _this.$store.state.userAddress,
              latitude: lat,
              longitude: long,
              latLong: latLng(long, lat),
              gasResistance: (point.gasResistance)/100,
              pressure: (point.pressure)/100,
              humidity: (point.humidity)/100,
              light: point.light,
              temperature: (point.temperature)/100,
              gyroscope: point.gyroscope,
              accelerometer: point.accelerometer,
              random: point.random,
              snr: point.snr,
              temperature2: (point.temperature2)/100,
              timestamp: moment.unix(dataPoint.timestamp).format("LLLL"),
            });
          }
          _this.deviceLocations = deviceData;

          // Log the telemetry
          _this.$store.state.isLoading = false;
          this.dialog = false;
          if (deviceData.length == 0) {
            _this.$store.dispatch("warning", {
              warning: "No Data found for this IMEI number",
            });
          }
        })
        .catch((error) => {
          console.log("error: ", error);
          _this.$store.state.isLoading = false;
          _this.$store.dispatch("error", {
            error: "Something went wrong while fetching device data",
            onTap: function() {},
          });
        });
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
    showDeviceDetails(icon) {
      this.$store.state.selectedDevice = icon;
      console.log("icon: ", icon);
      this.$store.state.deviceDetailsDialog = true;
    },
  },
};
</script>

<style></style>
