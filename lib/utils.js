var fs = require('fs'),
	path = require('path'),
	childProcess = require('child_process'),
	Promise = require('./tiny-promise');


/**
 * utility for looking up files - useful for when running from remote/container
 * as we do not want to copy all of the main app's node_modules dependancies
 *
 * @param path
 * @returns {boolean}
 */
function isFileAccessible(path) {
	try {
		stats = fs.lstatSync(path);
		return !stats.isDirectory();
	} catch (e) {
		console.log('ERROR: ', e);

		return false;
	}
}

/**
 *
 * @param ideName
 * @returns {*} path to the folder which contains the reporter js files that will be used with the
 * mocha command
 */
function getSourceReporterPath(ideName) {
	var reportersPath = '../reporters/';
	if (ideName === 'intellij') {
		return path.resolve(__dirname, reportersPath, 'intelliJ');
	} else {
		throw new Error('unsupported ide ' + ide);
	}
}

function getTargetReporterFilePath(tempPath) {
	return path.resolve(tempPath, 'reporter.js');
}

function getConfigFilePath(tempPath) {
	return path.resolve(tempPath, 'lastRunSettings.json');
}

/**
 * Helper function to easily wrap process execution in a promise
 * @param command
 * @param args
 * @param opts
 */
function executeCommand(opts) {
	var promise = new Promise();
	var returnData = '';
	var child = childProcess.spawn(opts.cmd, opts.args, {
		stdio: (opts.isShowingOutput && !opts.isReturningOutput) ? 'inherit' : null
	});

	if (opts.isReturningOutput) {
		child.stdout.on('data', function (data) {
			returnData += data;
		});
	}
	child.on('err', function (err) {
		// console.log('error executing command ' + opts.cmd + ' err: ', err);
		promise.reject(err);
	});

	child.on('exit', function (code) {
		// console.log('command ' + opts.cmd + ' exited with code ' + code);
		if (code === 0){
			promise.resolve(returnData);
		}else if (opts.isReturningOutput){
			promise.resolve(null);
		} else {
			promise.reject(new Error('command ' + opts.cmd + ' exited with code ' + code));
		}
	});
	return promise;
}

module.exports = {
	isFileAccessible: isFileAccessible,
	getSourceReporterPath: getSourceReporterPath,
	getTargetReporterFilePath: getTargetReporterFilePath,
	getConfigFilePath: getConfigFilePath,
	executeCommand: executeCommand
};


