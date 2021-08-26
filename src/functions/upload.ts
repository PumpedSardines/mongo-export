import genTempDir from "../lib/gen-temp-dir";
import mongo from "../lib/mongo";
import * as document from "../lib/document";
import { unzip } from "../lib/zip";

import { promises as fs } from "fs";
import * as path from "path";

interface UploadOptions {
    uri: string,
    file: string,
    db: string
}

export default async function upload({ uri, file, db: dbName }: UploadOptions) {

    const client = await mongo(uri).catch(() => {
        throw new Error("Can't connect to mongodb");
    });

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
                    .map((doc: any) => document.decode(doc));

                await db.collection(collection).insertMany(docs);
            }));

        }

    }

    await deleteTemp();
}