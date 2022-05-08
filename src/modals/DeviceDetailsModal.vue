<template>
  <v-row justify="center"  :key="Math.round(Math.random()* 100000012)">
    <v-dialog v-model="$store.state.deviceDetailsDialog" width="100vw">
      <v-card>
        <v-card-title
          style=" font-size:25px;  font-style: italic;
            font-family:cursive;"
        >
          Location Details
        </v-card-title>
        <v-card-text
          ><v-form ref="form" lazy-validation>
            <v-text-field
              v-model="$store.state.selectedDevice.timestamp"
              label="Date"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-model="$store.state.selectedDevice.latitude"
              label="Latitude"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-model="$store.state.selectedDevice.longitude"
              label="Latitude"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-model="$store.state.selectedDevice.owner"
              label="Owner"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>

            <v-text-field
              v-model="$store.state.selectedDevice.gasResistance"
              label="Gas Resistance"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>

            <v-text-field
              v-model="$store.state.selectedDevice.pressure"
              label="Pressure"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>

            <v-text-field
              v-model="$store.state.selectedDevice.temperature"
              label="Temperature"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>

            <v-text-field
              v-model="$store.state.selectedDevice.temperature2"
              label="Temperature 2 (Celcius)"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>

            <v-select
             :key="Math.round(Math.random()* 10100000)"
              :value="
                $store.state.selectedDevice
                  ? $store.state.selectedDevice.gyroscope
                  :$store.state.selectedDevice.temperature2
              "
              :items="
                $store.state.selectedDevice
                  ? $store.state.selectedDevice.gyroscope
                  : []
              "
              attach
              chips
              readonly
              multiple
              label="Gyroscope"
              :color="$store.state.primaryColor"
            ></v-select>

            <v-select
            :key="Math.round(Math.random()* 1000000)"
              :value="
                $store.state.selectedDevice
                  ? $store.state.selectedDevice.accelerometer
                  : $store.state.selectedDevice.temperature
              "
              :items="
                $store.state.selectedDevice
                  ? $store.state.selectedDevice.accelerometer
                  : []
              "
              attach
              chips
              readonly
              multiple
              label="Accelerometer"
              :color="$store.state.primaryColor"
            ></v-select> </v-form
        ></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="
              $store.state.deviceDetailsDialog = false;
              $store.state.selectedDevice = {};
            "
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  mounted() {
    this.$store.state.isLoading = false;
    console.log("")
  },
  created() {
    this.$store.state.isLoading = false;
  },
};
</script>

<style></style>