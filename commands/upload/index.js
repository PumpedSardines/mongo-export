const chalk = require("chalk");

const mongoConnect = require("../../lib/mongodb.js");
const docParser = require("../../lib/doc-parser");
const { unzip } = require("../../lib/zip");
const genTempDir = require("../../lib/create-temp-folder.js");

const path = require("path");
const fs = require("fs").promises

const { log } = console;



module.exports = async (uri, file, dbName) => {

    const [client, error] = await mongoConnect(uri, dbName);

    if (error) {
        client.close();
        console.log(chalk.redBright("Something went wrong..."))
    }

    const db = client.db(dbName);

    const [temp, deleteTemp] = await genTempDir();

    await unzip(file, temp);

    const configPath = path.resolve(temp, "config");
    const configRaw = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(configRaw);

    for (const { id, collection } of config) {
        
        const collectionPath = path.resolve(temp, id);
        
        if(await fs.access(collectionPath).then(_ => true).catch(_ => false)) {
            const files = await fs.readdir(collectionPath);

            await Promise.all(files.map(async (file) => {
                const filePath = path.resolve(collectionPath, file);
                
                const docs = JSON.parse(await fs.readFile(filePath, "utf-8"))
                    .map(doc => docParser.decode(doc));

                await db.collection(collection).insertMany(docs);
            }));

        }

    }

    await deleteTemp();
    client.close();

	log(chalk.green("done!"));
};