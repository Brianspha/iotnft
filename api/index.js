const morgan = require("morgan");
const app = require("restana")({});
const cors = require("cors");
const axios = require("axios").default;
const bodyParser = require("body-parser");
var Ddos = require('ddos')
var ddos = new Ddos({burst:10, limit:15})
app.use(ddos.express);
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use(morgan("combined"));

app.post("/", (req, res, next) => {
  console.log("imei: ", req.body.imei, req.body);
  axios({
    url: "http://34.146.117.200:8000/subgraphs/name/iotex/pebble-subgraph",
    method: "post",
    data: {
      query: `
          {
            deviceRecords(where: { imei:"${req.body.imei}"}) {
              raw # !! Protobuf encoded sensors values
              imei
              signature
            }
          }`,
    },
  })
    .then((result) => {
      console.log(result.data);
      res.statusCode = 200;
      res.send(result.data);
    })
    .catch((error) => {
      console.log("error: ", error);
      res.statusCode = 400;
      res.send({ data: { deviceRecords: [] } });
    });
});

async function start() {
  await app.start(process.env.PORT || 3000, "0.0.0.0");
  console.log(
    `======================Server Started on PORT ${process.env.PORT ||
      3000}======================`
  );
}
start();
