<template>
  <v-container fluid>
    <v-data-table
      :headers="headers"
      :items="deviceData"
      sort-by="timestamp"
      class="elevation-1"
      :search="search"
    >
      <template v-slot:top>
        <v-row align="center" justify="start">
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
                :items="
                  $store.state.userData ? $store.state.userData.imeis : []
                "
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
            background-color:#6bdcc6;
            color:white;border-radius: 5px;
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
          </v-toolbar></v-row
        >
      </template>
      <template #item.gyroscope="{ value }">
        <v-select :value="value[0]" :items="value" solo></v-select>
      </template>
      <template #item.accelerometer="{ value }">
        <v-select :value="value[0]" :items="value" solo></v-select>
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
  </v-container>
</template>

<script>
import { latLng } from "leaflet";
import MintNFTModal from "../modals/MintNFTModal.vue";
const moment = require("moment");
const bigNumber = require("bignumber.js");
export default {
  components: { MintNFTModal },
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
    "$store.state.showMyLocationsOnly": function(showMyLocations) {
      console.log("showMyLocations only? ", showMyLocations);
      if (showMyLocations) {
        this.$store.state.dappNFTs = this.$store.state.allDAppNFTs.filter(
          (nft) => {
            return nft.owner === this.$store.state.userAddress;
          }
        );
      } else {
        this.$store.state.dappNFTs == this.$store.state.allDAppNFTs;
      }
    },
    "$store.state.userData.imeis": async function(imeis) {
      console.log("$store.state.userData.imeis  changed value: ", imeis);
      if (imeis.length > 0) {
        this.imei = imeis[0];
      }
    },
    dialog(val) {
      val || this.close();
    },
    "$store.state.mintNFTDialog": function(showmintNFTDialog) {
      console.log("changed showDialogue: ", showmintNFTDialog);
      showmintNFTDialog || this.close();
    },
    "$store.state.userAddress": function() {
      this.mapKey++;
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    loadDeviceData: async function(imei) {
      console.log("device imei: ", imei);
      //     imei = "151358810263573"; //@dev for dev purposes
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
          console.log("device Data: ", result.data.data);
          /* if (result.data.data.pebble_device_record.length === 0) {
            this.$store.dispatch("warning", {
              warning: "The device does not have any data",
            });
          }
          else{

          }*/
          console.log(
            "this.$store.state.sampleData: ",
            this.$store.state.sampleLocationData
          );
          var data = this.$store.state.sampleLocationData.data
            .pebble_device_record;
          console.log("device data: ", data);
          data.map((point) => {
            console.log("current point: ", point);
            this.deviceData.push({
              owner: this.$store.state.userAddress,
              latitude: point.latitude,
              longitude: point.longitude,
              latLong: latLng(point.longitude, point.latitude),
              gasResistance: point.gasResistance,
              pressure: point.pressure,
              humidity: point.humidity,
              light: point.light,
              temperature: point.temperature,
              gyroscope: point.gyroscope
                .replace("[", "")
                .replace("]", "")
                .split(","),
              accelerometer: point.accelerometer
                .replace("[", "")
                .replace("]", "")
                .split(","),
              random: point.random,
              snr: point.snr,
              temperature2: point.temperature2,
              timestamp: moment.unix(point.timestamp).format("LLLL"),
              isNFT: false,
              isDelegated: false,
            });
          });

          this.$store.state.isLoading = false;
        })
        .catch((error) => {
          console.log("error fetching device data: ", error);
          this.$store.state.isLoading = false;
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
    mintNFT(item) {
      this.$store.state.isLoading = true;
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
