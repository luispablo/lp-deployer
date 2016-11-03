#!/usr/bin/env node
import chalk from "chalk"
import needsSSH from "./needsSSH";
import connectSSH from "./connectSSH";
import upload from "./upload";
import run from "./run";
import fs from "fs";

const REMOTE = "remote";
const DEFAULT_CONFIG_FILENAME = "lp-deployer.json";

const configFilename = process.argv[2] || DEFAULT_CONFIG_FILENAME;

console.info(`\n=== ${chalk.bold("lp-deployer")} ===\n`);
console.info(`- Using config file ${chalk.yellow.inverse(configFilename)}`);

const config = JSON.parse(fs.readFileSync(configFilename, "utf8"));
const hasSSH = needsSSH(config.upload, config.commands);

connectSSH(hasSSH, config.server)
  .then(run(config.commands && config.commands.pre))
  .then(upload(process.cwd(), config.upload))
  .then(run(config.commands && config.commands.post))
  .then(function (conn) {
    if (conn) {
      console.info(`- Closing connection with ${config.server}...`);
      conn.end();
    }
    console.info(`- ${chalk.green.bold("Done!")}\n`);
    process.exit(0);
  }).catch(function (error) {
    console.error(`- ${chalk.bold("Process halted!")}`);
    console.error(`${chalk.bold.red(error)}\n`);
    process.exit(1);
  });
