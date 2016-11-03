# lp-deployer
Run pre, post, local and remote scripts; and upload files (creating directories if necessary) if you need to. All through SSH

## Installation

```shell
yarn global add lp-deployer
```

## Usage

```shell
lpd configfile.json
```

where ```configfile.json``` is the configuration file. Or

```shell
lpd
```

and it will look for a file called ```lp-deployer.json``` in the current directory with the configuration.

## Configuration

The configuration file should be like this:

```json
{
  "server": "svrstaging",
  "commands": {
    "pre": [
      { "location": "local", "script": "yarn run build-prod" },
      { "location": "remote", "script": "systemctl stop yourawesomeapp_service" }
    ],
    "post": [
      { "location": "remote", "script": "yarn --prod" },
      { "location": "remote", "script": "systemctl start yourawesomeapp_service" },
      { "location": "local", "script": "knex migrate:latest --env={{{knexEnvironment}}}" }
    ]
  },
  "upload": {
    "directory": "/opt/yourapp",
    "items": [
      "app/routes",
      "app/models",
      "public",
      "config.js",
      "package.json",
      "server.js"
    ]
  }
}

```

this means:

### server

The target server to upload files and / or run remote commands.

### commands

Here you have two groups: **pre** and **post**. The **pre** group will be run before uploading files to the target, and the **post** group after. In each command you can specify if it has to be run locally in the computer from where you're deploying, or remotely in the target server.

### upload

#### directory

Where you want to copy the files and directories to.

#### items

A list of files and directories that you want to upload. If you specify a file it will be uploaded, if it's a directory it'll upload all files in it. The deployer will create all missing remote directories needed to complete this task.

## But... What if I have more than one environment to deploy to?

Easy! Have many configuration files, one for each environment.

You could use the ```lpd-deployer.json``` file as your default one, and for example ```lpd-deployer-staging.json``` for staging, ```lpd-deployer-prod.json``` for production and so on.

## Credits

[@luispablo](https://twitter.com/luispablo)
