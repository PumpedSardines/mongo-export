const go = require("golangify");
const chalk = require("chalk");
const { MongoClient } = require('mongodb');

const { log } = console;

const mongoConnect = go((uri) => new MongoClient(uri, {
    useUnifiedTopology: true,
    connectTimeoutMS: 3000,
    serverSelectionTimeoutMS: 3000
}).connect());


module.exports = go(async (uri, dbName) => {

    const [client, conError] = await mongoConnect(uri);

    if (conError) {
        log(chalk.redBright("Can't connect to uri " + chalk.bold(`"${uri}"`)));
        process.exit(1);
    }

    return client;

});