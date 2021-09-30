const app = require("restana")({});
app.use(require("morgan")("combined"));
const ApolloClient = require("apollo-client").ApolloClient;
const createHttpLink = require("apollo-link-http").createHttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const crossFetch = require("cross-fetch").default;
const gql = require("graphql-tag").default;
const graphClient = new ApolloClient({
  link: createHttpLink({
    uri: "http://subgraph.iott.network:8000/subgraphs/name/iotex/pebble-subgraph",
    fetch: crossFetch,
  }),
  cache: new InMemoryCache(),
});
app.use(require("cors")());
app.use(require("body-parser").json());

app.post("api/v1/getGraphData", async (req, res, next) => {
  console.log("req: ", req.body);
  var results = await graphClient.query({
    query: gql`
    {
      deviceRecords(where: { imei:"${req.body.IMEI}"}) {
        raw # !! Protobuf encoded sensors values
        imei
        signature
      }
    }`,
  });
  res.statusCode = 200
  res.send(results.data);
});

const start = async () => {
  try {
    await app.start(9000, "0.0.0.0");
    console.log(` api running on port: ${9000}`);
    console.log("----------------------------------------------------");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
start();

module.exports = app;
