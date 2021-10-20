<template>
  <v-row justify="center">
    <v-dialog v-model="$store.state.showNFTDetailsDialog" width="100vw">
      <v-card>
        <v-card-title class="text-h5">
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
              label="NFT Price (IOTEX)"
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
              label="Price Offering (IOTEX)"
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
            ></v-text-field> </v-form
        ></v-card-text>
        <v-row align="center" justify="center"
          ><v-btn :color="$store.state.primaryColor" @click="save"
            >Save AS PNG</v-btn
          ></v-row
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="
              $store.state.showNFTDetailsDialog = false;
              $store.state.selectedNFT = {};
            "
          >
            Close
          </v-btn>
          <v-btn
            v-if="
              valid &&
                $store.state.userAddress === $store.state.selectedNFT.owner
            "
            :color="$store.state.primaryColor"
            @click="burnNFT"
          >
            Burn
          </v-btn>
          <v-btn
            v-if="
              valid &&
                $store.state.userAddress !== $store.state.selectedNFT.owner
            "
            :color="$store.state.primaryColor"
            @click="purchase"
          >
            Purchase
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import bigNumber from "bignumber.js";

export default {
  data() {
    return {
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
    };
  },
  mounted() {
    //  this.$router.go();
  },
  methods: {
    purchase() {
      let _this = this;
      if (this.$refs.form.validate()) {
        if (
          (parseFloat(this.offerPrice) === parseFloat(0) &&
            parseFloat(this.$store.state.selectedNFT.price) ===
              parseFloat(this.offerPrice)) ||
          parseFloat(this.$store.state.selectedNFT.price) >=
            parseFloat(this.offerPrice)
        ) {
          _this.$store.state.isLoading = false;
          var message = {
            error:
              "Please ensure that the offer Price is greater than 0 or the current Price!!",
            onTap: () => {
              this.state.showNFTDetailsDialog = true;
            },
          };
          this.$store.dispatch("error", message);
        } else {
          const price = _this.$store.state.etherConverter(
            _this.offerPrice,
            "eth",
            "wei"
          );
          _this.$store.state.isLoading = true;
          _this.$store.state.ionftContract.methods
            .buyToken(_this.$store.state.selectedNFT.tokenId)
            .send({
              from: _this.$store.state.userAddress,
              gas: 6000000,
              value: price,
            })
            .then(async (receipt, error) => {
              var content = await this.$store.dispatch("getCeramicData");
              var found = false;
              content.leaderboard.map((user) => {
                if (user.wallet === _this.$store.state.userAddress) {
                  user.ionfts_bought = new bigNumber(user.ionfts_bought).plus(
                    price
                  );
                  found = true;
                }
                return user;
              });
              if (!found) {
                content.leaderboard.push({
                  wallet: _this.$store.state.userAddress,
                  twitter_username: _this.twitterUserName,
                  ionfts_minted: 0,
                  ionfts_bought: price,
                });
              }
              await _this.$store.dispatch("saveCeramicData", content);
              _this.$store.state.isLoading = false;
              _this.$store.dispatch(
                "success",
                "Succesfully purchased IOTNFT token"
              );
            })
            .catch((error) => {
              console.log("error: ", error);
              _this.$store.state.isLoading = false;
              var message = {
                error:
                  "Something went wrong whilst purchasing IOTNFT, please try again",
                onTap: () => {
                  this.state.showNFTDetailsDialog = true;
                },
              };
              this.$store.dispatch("error", message);
            });
        }
      }
    },
    save: async function() {
      const doodle = document.querySelector("css-doodle");
      console.log("doodle: ", doodle);
      let _this = this;
      this.$store.state.isLoading = true;
      doodle
        .export({
          scale: 6,
          download: true,
        })
        .then((data, error) => {
          _this.$store.state.isLoading = false;
          console.log("data,error: ", data, error);
        });
      /* open Dev tools to see the result */
    },
    burnNFT() {
      let _this = this;
      _this.$store.state.isLoading = true;
      _this.$store.state.ionftContract.methods
        .burnToken(_this.$store.state.selectedNFT.tokenId)
        .send({
          from: _this.$store.state.userAddress,
          gas: 6000000,
        })
        .then(async (receipt, error) => {
          var content = await this.$store.dispatch("getCeramicData");
          content.leaderboard.map((user) => {
            if (user.wallet === _this.$store.state.userAddress) {
              user.ionfts_minted--;
            }
            return user;
          });

          for (var index in content.data) {
            var data = content.data[index];
            data.map((nft) => {
              nft = nft.nfts.map((minted, index) => {
                console.log(
                  "minted: ",
                  minted,
                  "_this.$store.state.selectedNFT.tokenId: ",
                  _this.$store.state.selectedNFT.tokenId,
                  "equal: ",
                  minted.tokenId.toString() !==
                    _this.$store.state.selectedNFT.tokenId.toString()
                );
                if (
                  minted.tokenId.toString() !==
                  _this.$store.state.selectedNFT.tokenId.toString()
                ) {
                  return minted;
                } else {
                  delete nft.nfts[index];
                }
              });
              console.log("filtered: ", nft);
              return nft;
            });
            content.data[index] = data;
            console.log("content.data[index]: ", content.data[index]);
          }

          await _this.$store.dispatch("saveCeramicData", content);
          _this.$store.state.isLoading = false;
          _this.$store.dispatch("success", "Succesfully burnt IOTNFT token");
        })
        .catch((error) => {
          console.log("error: ", error);
          _this.$store.state.isLoading = false;
          var message = {
            error:
              "Something went wrong whilst burning your IOTNFT, please try again",
            onTap: () => {
              this.state.showNFTDetailsDialog = true;
            },
          };
          this.$store.dispatch("error", message);
        });
    },
  },
};
</script>

<style></style>
