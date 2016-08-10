var fs = require('fs-extra'),
	path = require('path'),
	utils = require('../../lib/utils.js'),
	promise = require('../../lib/tiny-promise');

/**
 * Utility methods for working with remote hosts.
 */


/**
 * Copies required files for a test run to the designated server location
 * @param config
 */
function copyFilesToRemote(config) {
	// var source = config.localTempFilesPath + '/*';
	var source = config.localTempFilesPath;
	var destination = config.remoteHost + ':' + path.resolve(config.remoteTempFilesPath, '..');

	return utils.executeCommand({
		cmd: 'scp',
		args: ['-r', source, destination],
		isShowingOutput: true
	});
}

function createRemoteTempFolder(config) {
	return utils.executeCommand({
		cmd: 'ssh',
		args: [config.remoteHost, 'mkdir -p ' + config.remoteTempFilesPath],
		isShowingOutput: true
	});
}

function launchTestRunner(config) {
	var launchArg = config.mode === 'remoteContainer' ? 'loadContainer' : '';
	return utils.executeCommand({
		cmd: 'ssh',
		args: [config.remoteHost, getTestRunnerPath(config) + ' ' + launchArg],
		isShowingOutput: true
	});
}

function executeTests(config) {
	console.log('Copying files to remote');
	createRemoteTempFolder(config)
		.then(function () {
			copyFilesToRemote(config)
				.then(function () {
					//scp files to remote location
					console.log('Executing remote runner');
					launchTestRunner(config);
				});
		});
}

function getTestRunnerPath(config) {
	return path.resolve(config.remoteTempFilesPath, 'test-runner.js');
}

module.exports = {
	executeTests: executeTests
};
