<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="leaderboard"
      item-key="wallet"
      class="elevation-1"
      :search="search"
      :custom-filter="filterOnlyLowerCaseText"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          label="Search"
          class="mx-4"
        ></v-text-field>
      </template>
      <template #item.twitter_username="{ value }">
        <a :href="'https:twitter.com/' + value"> @{{ value }} </a>
      </template>
    </v-data-table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      search: "",
      calories: "",
      leaderboard: [],
      data: {
        users: [],
      },
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Rank",
          align: "start",
          sortable: true,
          value: "rank",
        },
        {
          text: "Wallet (ETH)",
          value: "wallet",
          sortable: false,
        },
        { text: "Twitter", value: "twitter_username" },
        { text: "Total Bought(ETH)", value: "ionfts_bought" },
        { text: "IONFTS Minted", value: "ionfts_minted" },
      ];
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    filterOnlyLowerCaseText(value, search, item) {
      return (
        value != null &&
        search != null &&
        typeof value === "string" &&
        value
          .toString()
          .toLocaleLowerCase()
          .indexOf(search) !== -1
      );
    },
    init: async function() {
      this.$store.state.isLoading = true;
      let _this = this;
      var data = await this.$store.dispatch("getTextileData");
      console.log("getCeramicData: ", data);
      if (data.leaderboard.length > 0) {
        this.data.users = data.leaderboard.sort(
          (a, b) => parseInt(a.ionfts_bought) - parseInt(b.ionfts_bought)
        );
        this.data.users = data.leaderboard.sort(
          (a, b) => parseInt(a.ionfts_minted) - parseInt(b.ionfts_minted)
        );
        var i = 0;
        this.data.users.map((user) => {
          this.leaderboard.push({
            rank: `#${i + 1}${
              i + 1 == 1 ? " 👑" : i + 1 == 2 ? " 🚀" : i + 1 == 3 ? " 🔥" : " "
            }`,
            wallet: user.wallet,
            twitter_username: user.twitter_username,
            ionfts_bought: _this.$store.state.etherConverter(
              user.ionfts_bought,
              "wei",
              "eth"
            ),
            ionfts_minted: user.ionfts_minted,
          });
        });
      }
      //  console.log("found data: ", data);
      this.$store.state.isLoading = false;
    },
  },
};
</script>

<style></style>