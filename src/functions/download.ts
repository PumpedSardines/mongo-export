import mongo from "../lib/mongo";
import genTempDir from "../lib/gen-temp-dir";
import * as document from "../lib/document";
import { zip } from "../lib/zip";

import { v4 as uuid } from "uuid";
import { Db } from "mongodb";

import * as path from "path";
import { promises as fs } from "fs";

async function* encodeCollection(db: Db, name: string) {
	const amountPerFile = 400;
	const length = await db.collection(name).find({}).count();
	const amount = new Array(~~(length / amountPerFile)).fill(amountPerFile);
	if (length % amountPerFile !== 0) {
		amount.push(length % amountPerFile);
	}

	for (const [i, limit] of amount.entries()) {

		const skip = amount.filter((v, ind) => ind < i).reduce((x, y) => x + y, 0);

		const rawDocs = await db.collection(name).find({}).skip(skip).limit(limit).toArray();
		const docs = rawDocs.map(doc => document.encode(doc));

		yield docs;
	}

	return;
}

export default async function download(uri: string, file: string, dbName: string): Promise<void> {
	const client = await mongo(uri).catch(() => {
		throw new Error("Couldn't connect to mongodb");
	});

	const db = client.db(dbName);

	const [temp, deleteTemp] = await genTempDir();
	const collections = await db.listCollections().toArray();

	const config = await Promise.all(collections.map(
		async ({ name }) => {

			const id = uuid();
			const order = [];

			const dir = path.resolve(temp, id);

			await fs.access(dir).catch(() => {
				return fs.mkdir(dir, {
					recursive: true
				});
			});

			const writeOperations = [];
			for await (const chunk of encodeCollection(db, name)) {
				const fileId = uuid();
				const file = path.resolve(dir, fileId);
				order.push(fileId);
				writeOperations.push(fs.writeFile(file, JSON.stringify(chunk)).then());
			}

			await Promise.all(writeOperations);

			return {
				id,
				collection: name
			};
		}));

	await fs.writeFile(path.resolve(temp, "config"), JSON.stringify(config));
	await zip(temp, file);
	await deleteTemp();
}