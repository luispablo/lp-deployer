import { Promise } from "es6-promise";
import chalk from "chalk";
import { exec } from "child_process";

const runRemote = function (conn, command) {
  return new Promise(function (resolve, reject) {
    console.info(`- [REMOTE] ${chalk.green(command.script)}`);
    conn.exec(command.script, function (error, stream) {
      if (error) {
        if (command.continueOnError) {
          console.info(`- [REMOTE] ${chalk.yellow(command.script)}`);
          console.info(`              ${chalk.red(error)}`);
          resolve();
        } else {
          reject(error);
        }
      } else {
        stream.on("close", () => resolve())
              .on("data", data => console.info(chalk.blue.bold(data)))
              .stderr.on("data", function (data) {
                if (command.continueOnError) {
                  console.info(`- [REMOTE] ${chalk.yellow(command.script)}`);
                  console.info(`            ${chalk.red(data)}`);
                  resolve();
                } else {
                  reject(data);
                }
              });
      }
    });
  });
};

const runLocal = function (command) {
  return new Promise(function (resolve, reject) {
    console.info(`- [LOCAL] ${chalk.green(command.script)}`);
    exec(command.script, function (error, stdout, stderr) {
      if (error) {
        if (command.continueOnError) {
          console.info(`- [LOCAL] ${chalk.yellow(command.script)}`);
          console.info(`             ${chalk.red(error)}`);
          resolve();
        } else {
          reject(error);
        }
      } else {
        if (stdout) console.info(chalk.blue.bold(stdout));
        resolve();
      }
    });
  });
};

const runCommands = function (conn, commands) {
  return new Promise(function (resolve, reject) {
    if (commands.length > 0) {
      const currentCommand = commands.shift();
      if (currentCommand.location === "remote") {
        runRemote(conn, currentCommand)
          .then(() => runCommands(conn, commands))
          .then(() => resolve(conn))
          .catch(err => reject(err));
      } else {
        runLocal(currentCommand)
          .then(() => runCommands(conn, commands))
          .then(() => resolve(conn))
          .catch(err => reject(err));
      }
    } else {
      resolve(conn);
    }
  });
};

const run = function (commands) {
  return function (conn) {
    return new Promise(function (resolve, reject) {
      if (commands && commands.length > 0) {
        runCommands(conn, commands)
          .then(() => resolve(conn))
          .catch(err => reject(err));
      } else {
        console.warn(`- ${chalk.yellow.bold("No commands to run")}`);
        resolve(conn);
      }
    });
  }
};

export default run;
