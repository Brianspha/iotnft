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
       </div
    ></v-row>
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
      const gql = require("graphql-tag").default;
      let _this = this;
      _this.$store.state.isLoading = true;
      // Run the query
      const queryResult = await this.$store.state.graphClient.query({
        query: gql`
    {
      deviceRecords(where: { imei:"${this.deviceIMEI}"}) {
        raw # !! Protobuf encoded sensors values
        imei
        signature
      }
    }`,
      });

      // Log all the data points to the console
      console.log(queryResult.data.deviceRecords);

      // Let's decode the first data message

      var deviceData = [];
      for (var index in queryResult.data.deviceRecords) {
        const dataPoint = queryResult.data.deviceRecords[index];
        const protobuf = require("protobufjs");

        // Load the protobuf definition, it's on GitHub at
        // https://github.com/iotexproject/iott-dapp-example/blob/main/service/proto/pebble.proto
        const pebbleProtoDef = await protobuf.parse(this.$store.state.pebble)
          .root;
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
        var lat = _this.getRandomInRange(-90, 90, 7);
        var long = _this.getRandomInRange(-180, 180, 7);
        deviceData.push({
          owner: _this.$store.state.userAddress,
          latitude: lat,
          longitude: long,
          latLong: latLng(long, lat),
          gasResistance: point.gasResistance,
          pressure: point.pressure,
          humidity: point.humidity,
          light: point.light,
          temperature: point.temperature,
          gyroscope: point.gyroscope,
          accelerometer: point.accelerometer,
          random: point.random,
          snr: point.snr,
          temperature2: point.temperature2,
        });
      }
      _this.deviceLocations = deviceData;
      _this.$store.state.isLoading = false;
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
