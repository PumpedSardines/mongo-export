const path = require("path");
const fs = require("fs").promises;

const chalk = require("chalk");
const cliProgress = require('cli-progress');
const go = require("golangify");
const { v4: uuid } = require("uuid");

const genTempDir = require("../../lib/create-temp-folder.js");
const mongoConnect = require("../../lib/mongodb.js");
const docParser = require("../../lib/doc-parser");
const { zip } = require("../../lib/zip");

const { log } = console;

async function* getDocs(db, name, cb) {
	const amountPerFile = 400;
	const length = await db.collection(name).find({}).count();
	const amount = new Array(~~(length / amountPerFile)).fill(amountPerFile)
	if (length % amountPerFile !== 0) {
		amount.push(length % amountPerFile);
	}

	cb(amount.length);

	for (const [i, limit] of amount.entries()) {

		const skip = amount.filter((v, ind) => ind < i).reduce((x, y) => x + y, 0);

		const rawDocs = await db.collection(name).find({}).skip(skip).limit(limit).toArray();
		const docs = rawDocs.map(doc => docParser.encode(doc));

		yield docs;
	}

	return;
}

module.exports = async (uri, file, dbName) => {

	const [client, error] = await mongoConnect(uri, dbName);

    const [databases, fetchDbError] = (await go(() => client.db("admin").admin().listDatabases())());

    if (fetchDbError) {
        log(chalk.redBright("Can't fetch dbs"));
        process.exit(1);
    }

    if (!databases.databases.map(v => v.name).includes(dbName)) {
        log(chalk.redBright(`Database ${chalk.bold(`"${dbName}"`)} doesn't exist`));
        process.exit(1);
    }


	if (error) {
		client.close();
		console.log(chalk.redBright("Something went wrong..."))
	}

	const db = client.db(dbName);

	const [temp, deleteTemp] = await genTempDir();

	const collections = await db.listCollections().toArray();

	const multibar = new cliProgress.MultiBar({
		clearOnComplete: false,
		hideCursor: true,
		format: "[{bar}]  " + chalk.blue("{file}"),
		barCompleteChar: '#',
		barsize: 50,
		barIncompleteChar: '=',
	}, cliProgress.Presets.shades_grey);

	const config = await Promise.all(collections.map(
		async ({ name }) => {

			const id = uuid();
			const order = [];

			const dir = path.resolve(temp, id);

			await fs.access(dir).catch(_ => {
				return fs.mkdir(dir, {
					recursive: true
				});
			});

			let bar = null;

			const cb = (amount) => {
				bar = multibar.create(amount, 0, {
					file: name
				});
			};

			const writeOperations = [];
			for await (const chunk of getDocs(db, name, cb)) {
				const fileId = uuid();
				const file = path.resolve(dir, fileId);
				order.push(fileId)
				writeOperations.push(fs.writeFile(file, JSON.stringify(chunk)).then());
				bar.increment();
			}

			await Promise.all(writeOperations);
			bar.stop();

			return {
				id,
				collection: name
			}
		}));

	multibar.stop();

	await fs.writeFile(path.resolve(temp, "config"), JSON.stringify(config));
	await zip(temp, file);
	await deleteTemp();
	client.close();
	log(chalk.green("done!"));

};