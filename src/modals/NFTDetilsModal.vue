<template>
  <v-row justify="center">
    <v-dialog v-model="$store.state.showNFTDetailsDialog" width="100vw">
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
              $store.state.showNFTDetailsDialog = false;
              $store.state.selectedNFT = {};
            "
          >
            Close
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
    </v-dialog>
  </v-row>
</template>

<script>
import bigNumber from "bignumber.js";

export default {
  data() {
    return {
      showToolTip: false,
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
  created() {
    this.$store.state.isLoading = false;

    console.log(
      "this.$store.state.selectedNFT.price: ",
      this.$store.state.selectedNFT
    );
  },
  mounted() {
    this.$store.state.isLoading = false;
    //this.$store.state.selectedNFT.price=etherConverter(this.$store.state.selectedNFT.price,"wei","eth")
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
              _this.$store.state.reload = true;
              _this.$store.state.selectedNFT = {};
              _this.$store.state.showNFTDetailsDialog = false;
            })
            .catch((error) => {
              console.log("error: ", error);
              _this.$store.state.isLoading = false;
              var message = {
                error:
                  "Something went wrong while purchasing IOTNFT, please try again",
                onTap: () => {
                  this.state.showNFTDetailsDialog = true;
                },
              };
              _this.$store.dispatch("error", message);
              _this.$store.state.reload = true;
              _this.$store.state.selectedNFT = {};
              _this.$store.state.showNFTDetailsDialog = false;
            });
        }
      }
    },
    delegate: async function() {
      let _this = this;
      _this.$store.state.isLoading = true;
      _this.$store.state.tokenContract.methods
        .transferFrom(
          _this.$store.state.userAddress,
          _this.$store.state.ionftContract.options.address,
          this.$store.state.selectedNFT.tokenId
        )
        .send({ from: _this.$store.state.userAddress, gas: 5000000 })
        .then((receipt, error) => {
          console.log("results of transferring token to IONFT: ", receipt);
          _this.$store.state.ionftContract.methods
            .delegateNFT(
              this.$store.state.selectedNFT.tokenId,
              !this.$store.state.selectedNFT.isDelegated
            )
            .send({ from: _this.$store.state.userAddress, gas: 5000000 })
            .then((receipt, error) => {
              _this.$store.state.isLoading = false;
              console.log("results of delegating token: ", receipt);
              if (_this.$store.state.selectedNFT.isDelegated) {
                _this.$store.dispatch(
                  "success",
                  "Succesfully revoked delegation of token to the IONFT Contract, please check if the token appears in your assets tab on metamask!"
                );
              } else {
                _this.$store.dispatch(
                  "success",
                  "Succesfully delegated token to the IONFT Contract"
                );
              }
            })
            .catch((error) => {
              console.log("error delegating NFT: ", error);
              _this.$store.state.isLoading = false;
              var message = {
                error: _this.$store.state.selectedNFT.isDelegated
                  ? "Something went wrong while revoking delegation of token from IONFT Contract"
                  : "Something went wrong while delegating token to IONFT",
                onTap: () => {
                  this.state.showNFTDetailsDialog = true;
                },
              };
              _this.$store.dispatch("error", message);
            });
        })
        .catch((error) => {
          console.log("error transferring token to IONFT contract: ", error);
        });
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
          _this.$store.state.showNFTDetailsDialog = false;
          _this.$store.state.selectedNFT={}
          _this.$store.state.reload = true;
        })
        .catch((error) => {
          console.log("error: ", error);
          _this.$store.state.isLoading = false;
          var message = {
            error:
              "Something went wrong while burning your IOTNFT, please try again",
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
