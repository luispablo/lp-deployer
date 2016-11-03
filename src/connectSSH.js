import ssh2 from "ssh2";
import inquirer from "inquirer";
import { Promise } from "es6-promise";

const connectSSH = function (hasSSH, host) {
  return new Promise(function (resolve) {
    if (hasSSH) {
      console.info(`- Connecting to ${host} via SSH...`);
      inquirer.prompt([
        { name: "username", message: "Please type the username" },
        { name: "password", type: "password", message: "and the password" }
      ]).then(function (answers) {
        answers.host = host;
        const conn = new ssh2.Client();
        conn.on("ready", function () {
          console.info(`- Connected to ${host}.`);
          resolve(conn);
        }).connect(answers);
      });
    } else {
      resolve();
    }
  });
};

export default connectSSH;
