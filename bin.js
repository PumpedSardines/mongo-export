const { Command } = require('commander');
const chalk = require('chalk');
const path = require("path");
const program = new Command();

program
  .version('0.0.1', '--version', 'output the current version')
  .helpOption('--help')

// Upload command
program
  .command('download')
  .description('Export a mongodb database')
  .requiredOption("-f, --file <file>", "file to export / import to")
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
    }

    const download = require("./commands/download/index.js");

    download(data.uri, data.file, data.db);

  });



// Download command
program
  .command('upload')
  .description('Import a mongodb export')
  .requiredOption("-f, --file <file>", "file to export / import to")
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
    }

    const upload = require("./commands/upload/index.js");

    upload(data.uri, data.file, data.db);

  });

program.parse(process.argv);