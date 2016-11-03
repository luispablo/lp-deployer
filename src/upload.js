import { Promise } from "es6-promise";
import ProgressBar from "progress";
import allFilesInTree from "all-files-in-tree";

function mkDir (sftp, dir) {
	return new Promise(function (resolve, reject) {
		var correctedDir = (dir.lastIndexOf("/") === dir.length - 1) ? dir.substring(0, dir.length - 1) : dir;

		sftp.stat(correctedDir, function (error) {
			if (error) {
				if (error.code === 2) {
					var parentPath = correctedDir.substring(0, correctedDir.lastIndexOf("/"));

					mkDir(sftp, parentPath).then(function () {
						console.log("Creating new directory", correctedDir);
						sftp.mkdir(correctedDir, function (error) {
							if (error && error.code === 4) resolve();
							else if (error) reject(error);
							else resolve();
						});
					});
				} else {
					reject(error);
				}
			} else {
				resolve();
			}
		});
	});
}

function put (sftp, localFile, remoteFile) {
	return new Promise(function (resolve, reject) {
		sftp.fastPut(localFile, remoteFile, function (error) {
			if (error) reject(error);
			else resolve();
		});
	});
}

function uploadFile (sftp, file, localDirectory, remoteDirectory) {
	return new Promise(function (resolve) {
		var localFile = localDirectory +"/"+ file;
		var remoteFile = remoteDirectory +"/"+ file;
		var directory = remoteFile.substring(0, remoteFile.lastIndexOf("/"));

		mkDir(sftp, directory).then(function () {
			put(sftp, localFile, remoteFile).then(function () { resolve(); });
		});
	});
}

const upload = function (localDirectory, config) {
  return function (conn) {
    return new Promise(function (resolve, reject) {
      const files = config.items.map(f => allFilesInTree.sync(f)).reduce((p, c) => p.concat(c), []);

			conn.sftp(function(error, sftp) {
				if (error) {
					reject(error);
				} else {
					let uploadedQuantity = 0;
					const bar = new ProgressBar("- Uploading files [:bar]", {width: 20, total: files.length});
					bar.tick();

					files.forEach(function (file) {
						uploadFile(sftp, file, localDirectory, config.directory).then(function () {
							bar.tick();
							if (++uploadedQuantity === files.length) resolve(conn);
						});
					});
				}
			});
    })
  };
};

export default upload;
