<template>
  <v-container fluid>
    <map-component
      :mapData="$store.state.deviceData"
      :nonNFTIcon="nonNFTIcon"
    ></map-component>
    <v-row justify="center" align="center"
      style="padding-top: 5%;"><v-btn
        style="
            background-color:#383838;
            color:white;border-radius: 5px;
            font-style: italic;
            border-color: #699c79;
            border-width: 1px;
            font-family:cursive;
            font-weight:bold;
            color:white;
        "
        @click="$router.push('/app')"
        width="200px"
        >Back</v-btn
      >
    </v-row>
  </v-container>
</template>

<script>
import MapComponent from "../components/MapComponent.vue";

export default {
  components: {
    MapComponent,
  },
  data() {
    return {
      nonNFTIcon:
        "https://siasky.net/XAGadoRyJgutpKMc_zofHmDAJiGFgPZch6cXUE8aeS2R7w",
    };
  },
  computed: {},
  methods: {},
};
</script>

<style></style>
