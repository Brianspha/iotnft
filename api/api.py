from flask import Flask, request, jsonify
import requests

app = Flask(__name__)


@app.route("/")
def index():
    print("JSON: ", request.json)
    imei = request.json
    print(imei)
    results = requests.post('http://34.146.117:8000/subgraphs/name/iotex/pebble-subgraph/graphql',
                            """
    {
      deviceRecords(where: { imei: "%s" }) {
        raw
        imei
        signature
        timestamp
      }
    }
    """ % (imei))
    print(results.text)
    if results.status_code == 200:
        return results.json()
    else:
        return {
            "data": {
                "deviceRecords": []
            }
        }
