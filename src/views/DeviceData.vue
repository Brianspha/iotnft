<template>
  <v-data-table
    :headers="headers"
    :items="deviceData"
    sort-by="timestamp"
    class="elevation-1"
    :search="search"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-col>
          <v-text-field
            :color="$store.state.primaryColor"
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-col>
        <v-spacer></v-spacer>
        <v-col class="d-flex" cols="12" sm="3">
          <v-select
            dense
            :value="imei"
            solo
            :items="$store.state.userData ? $store.state.userData.imeis : []"
            filled
            label="Registered Devices"
            @change="loadDeviceData"
          ></v-select>
          <div style="padding-right:5px;"></div>
          <v-btn
            v-if="imei.length !== ''"
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
            text
            @click="loadDeviceData(imei)"
          >
            Get Data
          </v-btn>
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
            text
            disabled
          >
            Get data
          </v-btn>
        </v-col>
      </v-toolbar>
    </template>
    <template #item.gyroscope="{ value }">
      <v-select :v-model="value" :items="value" solo></v-select>
    </template>
    <template #item.accelerometer="{ value }">
      <v-select :v-model="value" :items="value" solo></v-select>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-btn
        small
        class="mr-2"
        @click="
          mintNFT(item);
          $store.state.mintNFTDialog = true;
        "
        style=" background-color:#6bdcc6;color:
            white;border-radius: 5px;
            font-style: italic;
            border-color: #699c79;
            border-width: 1px;
            font-family:cursive;
            font-weight:bold;
            color:white;"
      >
        Mint
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
import { latLng } from "leaflet";
const moment = require("moment");
const bigNumber = require("bignumber.js");
export default {
  data: () => ({
    nftName: "",
    nameRules: [
      (v) => !!v || "NFT name required",
      (v) =>
        (v && v.length >= 4 && v.length <= 15) ||
        "NFT name must be atleast 4 characters",
    ],
    nftPrice: 0,
    twitterUserName: "",
    usernameRules: [
      (v) => !!v || "Username required",
      (v) =>
        (v && v.length >= 4 && v.length <= 15) ||
        "Twitter username must be atleast 4 characters or less than equal to 15 characters",
    ],
    valid: false,
    offerPrice: 0,
    priceRules: [
      (v) => !!v || "Offer Price is required",
      (v) =>
        (v && !isNaN(v) && parseFloat(v) > 0) ||
        "Offer Price must be a valid amount",
    ],
    search: "",
    dialog: false,
    MintNFTModaldialog: false,
    dialogDelete: false,
    headers: [
      { text: "Timestamp", value: "timestamp", sortable: true, align: "start" },
      {
        text: "Snr",
        value: "snr",
      },
      { text: "Vbat", value: "vbat" },
      { text: "Latitude", value: "latitude" },
      { text: "Longitude", value: "longitude" },
      { text: "Gas Resistance", value: "gasResistance" },
      { text: "Temperature (Celcius)", value: "temperature" },
      { text: "Pressure", value: "pressure" },
      { text: "Humidity", value: "humidity" },
      { text: "Light", value: "light" },
      { text: "Temperature 2 (Celcius)", value: "temperature2" },
      { text: "Random", value: "random" },
      { text: "Gyroscope", value: "gyroscope" },
      { text: "Accelerometer", value: "accelerometer" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    deviceData: [],
    editedIndex: -1,
    editedItem: {
      IMEI: "",
    },
    imei: "",
  }),

  computed: {},

  watch: {
    "$store.state.userData.imeis": async function(imeis) {
      console.log("$store.state.userData.imeis  changed value: ", imeis);
      if (imeis.length > 0) {
        this.imei = imeis[0];
      }
    },
    dialog(val) {
      val || this.close();
    },
    "$store.state.mintNFTDialog": function(val) {
      console.log("changed value: ", val);
      val || this.close();
    },
    "$store.state.userAddress": function() {
      this.mapKey++;
      // this.loadData();
    },
  },

  created() {
    this.initialize();
    this.loadData();
  },

  methods: {
    loadDeviceData: async function(imei) {
      console.log("device imei: ", imei);
//      imei = "151358810263573"; //@dev for dev purposes
      this.$store.state.isLoading = true;
      const axios = require("axios").default;
      axios({
        url: process.env.VUE_APP_TRUSTREAM_SUBGRAPH,
        method: "post",
        data: {
          query: `
      query pebble_device_record(
    order_by: { timestamp: desc }
    where: { imei: { _eq: "${imei}" } }
  ) {
    longitude
    latitude
    timestamp
    temperature
    temperature2
    created_at
    gyroscope
    accelerometer
    gyroscope
    light
    vbat
    gas_resistance
    snr
    pressure
    id
    humidity
    hash
  }
      `,
        },
      })
        .then((result) => {
          console.log("device Data: ", result.data);
          this.$store.dispatch("warning", {
            warning: "The device does not have any data",
          });
          this.$store.state.isLoading = false;
        })
        .catch((error) => {
          console.log("error fetching device data: ", error);
          this.$store.state.isLoading = false;
        });
    },
    getGraphData: async function() {
      // below ordinary XHR request with console.log
      const gql = require("graphql-tag").default;
      let _this = this;
      _this.$store.state.isLoading = true;
      const axios = require("axios").default;
      axios({
        method: "post",
        url: process.env.VUE_APP_TRUSTREAM_SUBGRAPH,
        data: JSON.stringify({
          imei: this.imei,
        }),
        headers: {
          // Overwrite Axios's automatically set Content-Type
          "Content-Type": "application/json; charset=utf-8",
        },
      })
        .then(async (queryResult) => {
          const moment = require("moment");
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

            var lat = new bigNumber(point.latitude)
              .dividedBy(new bigNumber(10).pow(7))
              .toFixed(3);
            var long = new bigNumber(point.longitude)
              .dividedBy(new bigNumber(10).pow(7))
              .toFixed(3);
            deviceData.push({
              owner: _this.$store.state.userAddress,
              latitude: lat,
              longitude: long,
              latLong: latLng(long, lat),
              gasResistance: point.gasResistance / 100,
              pressure: point.pressure / 100,
              humidity: point.humidity / 100,
              light: point.light,
              temperature: point.temperature / 100,
              gyroscope: point.gyroscope,
              accelerometer: point.accelerometer,
              random: point.random,
              snr: point.snr,
              temperature2: point.temperature2 / 100,
              timestamp: moment.unix(dataPoint.timestamp).format("LLLL"),
            });
          }
          if (_this.$store.state.userData === null) {
            _this.$store.state.userData = {
              userAddress: _this.$store.state.userAddress,
              imeis: [],
              data: [],
            };
          }
          _this.$store.state.userData.imeis.push(_this.imei);
          _this.$store.state.userData.data.push({
            imei: _this.imei,
            nfts: [],
          });
          this.deviceData = deviceData;

          // Log the telemetry
          console.log(deviceData, "userData: ", _this.$store.state.userData);
          _this.$store.state.isLoading = false;
          this.dialog = false;
          if (this.deviceData.length == 0) {
            _this.$store.dispatch("warning", {
              warning: "No Data found for this IMEI number",
            });
          }
        })
        .catch((error) => {
          console.log("error: ", error);
          _this.$store.state.isLoading = false;
          _this.$store.dispatch("error", {
            error: "Something went wrong whilst fetching device data",
            onTap: function() {},
          });
        });
    },
    initialize() {
      if (
        this.$store.state.userData &&
        this.$store.state.userData.data.length > 0
      ) {
        this.deviceData = this.$store.state.userData.data[0].data;
        console.log("this.$store.state.userData: ", this.$store.state.userData);
      }
    },
    loadData: async function() {
      let _this = this;
      this.$store.state.isLoading = true;
      var content = await this.$store.dispatch("getCeramicData");
      /* content.data = [];
      content.leaderboard = [];
      await this.$store.dispatch("saveCeramicData", content); */
      for (var index in content.data) {
        var data = content.data[index];
        if (
          data.userAddress.toUpperCase() ===
          _this.$store.state.userAddress.toUpperCase()
        ) {
          _this.$store.state.userData = data;
        }
      }
      this.$store.state.isLoading = false;
    },
    mintNFT(item) {
      item.imei = this.imei;
      this.$store.state.selectedNFT = item;
      this.$store.state.mintNFTDialog = true;
    },

    burnNFT(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    close() {
      this.dialog = false;
      this.$store.state.mintNFTDialog = false;
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    getRandomInRange(from, to, fixed) {
      return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
      // .toFixed() returns string, so ' * 1' is a trick to convert to number
    },
    save() {},
  },
};
</script>

<style></style>
