<template>
  <v-row justify="center">
   <v-card>
        <v-card-title
          style=" font-size:25px;  font-style: italic;
            font-family:cursive;"
        >
          NFT Details
        </v-card-title>
        <v-card-text
          ><v-form ref="form" v-model="valid" lazy-validation>
            <v-row style="padding-bottom:40px;"
              ><vue-css-doodle
                ref="doodle"
                :key="$store.state.selectedNFT.colorPallet"
              >
                {{ $store.state.selectedNFT.doodleStyle }}
              </vue-css-doodle></v-row
            >
            <v-text-field
              v-model="$store.state.selectedNFT.name"
              label="NFT Name"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-model="$store.state.selectedNFT.price"
              label="NFT Price (ETH)"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-model="$store.state.selectedNFT.owner"
              label="Current Owner"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-model="$store.state.selectedNFT.latitude"
              label="Latitude"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-model="$store.state.selectedNFT.longitude"
              label="Latitude"
              readonly
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-if="$store.state.userAddress !== $store.state.selectedNFT.owner"
              v-model="offerPrice"
              :rules="priceRules"
              label="Price Offering (ETH)"
              required
              :color="$store.state.primaryColor"
            ></v-text-field>
            <v-text-field
              v-if="$store.state.userAddress !== $store.state.selectedNFT.owner"
              v-model="twitterUserName"
              :rules="usernameRules"
              label="Twitter Username"
              hint="e.g. brianspha_"
              required
              :color="$store.state.primaryColor"
            ></v-text-field>

            <v-text-field
              v-if="$store.state.userAddress === $store.state.selectedNFT.owner"
              v-model="$store.state.selectedNFT.twitter_username"
              :rules="usernameRules"
              label="Twitter Username"
              hint="e.g. brianspha_"
              required
              readonly
            ></v-text-field>
            <v-row align="center" justify="start"
              ><v-checkbox
                color="#699c79"
                :value="$store.state.selectedNFT.isDelegated"
                :v-model="$store.state.selectedNFT.isDelegated"
                label="Token Delegated Ownership?"
                readonly
              ></v-checkbox>
              <v-tooltip v-model="showToolTip" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    style="padding-left:30px;"
                    width="4px"
                    height="4px"
                    color="#699c79"
                    icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon small color="#699c79">
                      mdi-alert-circle
                    </v-icon>
                  </v-btn>
                </template>
                <span
                  >Delagating to contract means you intend on allowing others to
                  purchase the NFT from IONFT</span
                >
              </v-tooltip></v-row
            >
          </v-form></v-card-text
        >
        <v-row align="center" justify="center"
          ><v-btn
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
            @click="save"
            >Save AS PNG</v-btn
          >
          <div style="padding-left:15px;"></div>
          <v-btn
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
            v-if="
              valid &&
                $store.state.userAddress === $store.state.selectedNFT.owner
            "
            :color="$store.state.secondaryColor"
            @click="delegate"
          >
            {{
              $store.state.selectedNFT.isDelegated
                ? "Revoke Delegation"
                : "Delegate"
            }}
          </v-btn>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="
              router.push('/');
              $store.state.selectedNFT = {};
            "
          >
            Back
          </v-btn>
          <v-btn
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
            v-if="
              valid &&
                $store.state.userAddress === $store.state.selectedNFT.owner
            "
            @click="burnNFT"
          >
            Burn
          </v-btn>
          <v-btn
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
            v-if="
              valid &&
                $store.state.userAddress !== $store.state.selectedNFT.owner &&
                $store.state.selectedNFT.isDelegated
            "
            :color="$store.state.primaryColor"
            @click="purchase"
          >
            Purchase
          </v-btn>
        </v-card-actions>
      </v-card>
  </v-row>
</template>

<script>
export default {

}
</script>

<style>

</style>