const { Client, PrivateKey, UserAuth, Identity, KeyInfo, ThreadID, Buckets } = require('@textile/hub')
const keyInfo = {
    key: process.env.VUE_APP_TEXTITLE_KEY,
    secret: process.env.VUE_APP_TEXTITLE_SECRET
}
async function setup() {
    var client = await Client.withKeyInfo(keyInfo);
    return client
}
async function getThread() {
    const client = await setup();
    const threads = await client.listThreads()
    return ThreadID.fromString(threads[threads.length - 1].id)
}
async function getAllPebbles() {
    const client = await setup();
    const threadId = await getThread();
    const pebbles = await client.find(threadId, process.env.VUE_APP_COLLECTION_NAME, {})
    console.debug('found pebbles length:', pebbles.length, " data pebbles: ", pebbles)
    return pebbles
}
async function createNewClient() {
    var client = await Client.withKeyInfo(keyInfo);
    const identity = PrivateKey.fromRandom()
    await client.getToken(identity)
    await client.getToken(identity)
    const threadId = ThreadID.fromRandom();
    console.log('client: ', client, 'threadId: ', threadId)
    await client.newDB(threadId)
    console.log('keyInfo: ', keyInfo, ' threadId: ', threadId)
    const schema = {
        "type": "object",
        "properties": {
             "data": {
                "type": "array"
            },
            "leaderboard": {
                "type": "array"
            },
            "_id": {
                "type": "string"
            },

        },
        "required": [
            "data",
            "_id",
            "leaderboard"
        ]
    }
    console.log('schema: ', schema)
    /**
     * We add our first Collection to the DB for any schema.
     */
    await client.newCollection(threadId, { name: process.env.VUE_APP_COLLECTION_NAME, schema });
    return { threadId: threadId, client: client };
}

async function createEntity(jsonData) {
    const client = await setup();
    const threadId = await getThread();
    /**
     * Create a new Pebble entity
     *
     * Our Thread contains the Pebble device Collection minted as nFTs, so you just need
     * to add a new Pebble that matches the expected schema.
     *
     * If you run this app many times, you'll notice many Buzz Aldrin
     * entries in your ThreadDB, each with a unique ID.
     */
    console.log('attempting to use client ', client, ' threadId: ', threadId, ' jsonData: ', jsonData)
    const ids = await client.create(threadId, process.env.VUE_APP_COLLECTION_NAME, [
        jsonData,
    ]);
    return ids;
}

async function updatePebble(pebbleData) {
    console.log("updating pebble data: ", pebbleData)
    const client = await setup();
    const threadId = await getThread();
    await client.save(threadId, process.env.VUE_APP_COLLECTION_NAME, pebbleData)
    console.log('saved pebble data');
    return true
}

async function initIndex() {
    // Create a json model for the index
    var bucketInfo = await getBucketInfo()
    const index = {
        author: "barMyPebble",
        date: (new Date()).getTime(),
        paths: [],
    }
    // Store the index in the Bucket (or in the Thread later)
    const buf = Buffer.from(JSON.stringify(index, null, 2))
    const path = `index.json`
    await bucketInfo.buckets.pushPath(bucketInfo.bucketKey, path, buf)
}
async function getBucketInfo() {
    // Use the insecure key to set up the buckets client
    const buckets = await Buckets.withKeyInfo(keyInfo)
    // Authorize the user and your insecure keys with getToken

    const result = await buckets.getOrCreate('io.textile.dropzone')
    if (!result.root) {
        throw new Error('Failed to open bucket')
    }
    return {
        buckets: buckets,
        bucketKey: result.root.key,
    }
}
getAllPebbles([{
    data:[],
    leaderboard:[],
    _id:"01g37yk85mnejjgg0mt1e772j5"
}]).then((created)=>{
    console.log("created: ",created)
})
module.exports = {
    createNewClient,
    getAllPebbles,
    getThread,
    updatePebble,
    createEntity,
    setup,
    getBucketInfo
}