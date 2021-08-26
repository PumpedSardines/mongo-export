import { Command } from "commander";
import chalk from "chalk";

import download from "./functions/download";
import upload from "./functions/upload";

import * as path from "path";

const program = new Command();

program
    .version('0.0.1', '--version', 'output the current version')
    .helpOption('--help');

// Upload command
program
    .command('download')
    .description('Downloads a mongodb database')
    .requiredOption("-f, --file <file>", "file to download")
    .requiredOption("-d, --database <database>", "database to download")
    .option("-a, --auth <auth>", "Authentication (example: \"username:password\")")
    .option("-h, --host <host>", "mongodb host", "127.0.0.1")
    .option("-p, --port <port>", "mongodb port", "27017")
    .configureOutput({
        writeOut: (str) => console.log(str),
        writeErr: (str) => console.log(chalk.red(str)),
    })
    .action(async (env, options) => {
        env = env || 'all';

        const data = {
            db: env.database,
            file: path.resolve(process.cwd(), env.file),
            uri: `mongodb://${env.auth ? env.auth + "@" : ""}${env.host}:${env.port}`
        };

        await download(data);
    });



// Download command
program
    .command('upload')
    .description('Uploads a downloaded mongodb database')
    .requiredOption("-f, --file <file>", "path to downloaded mongodb database")
    .requiredOption("-d, --database <database>", "database to upload into")
    .option("-a, --auth <auth>", "Authentication (example: \"username:password\")")
    .option("-h, --host <host>", "mongodb host", "127.0.0.1")
    .option("-p, --port <port>", "mongodb port", "27017")
    .configureOutput({
        writeOut: (str) => console.log(str),
        writeErr: (str) => console.log(chalk.red(str)),
    })
    .action(async (env, options) => {
        env = env || 'all';

        const data = {
            db: env.database,
            file: path.resolve(process.cwd(), env.file),
            uri: `mongodb://${env.auth ? env.auth + "@" : ""}${env.host}:${env.port}`
        };

        await upload(data);

    });

program.parse(process.argv);