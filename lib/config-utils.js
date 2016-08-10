var utils = require('./utils.js');
var fs = require('fs');

/**
 * loads config from a config json file.
 * Valid config settings are:
 *
 *   "ide": ide executing tests valid values "intellij"
 *   "mochaPath": location of mocha package to execute (
 *                  e.g. /src\node_packages/mocha, for a mapped docker container
 *                  e.g /Users/gcook/company/project/service\node_modules/mocha, for a remote machine
 *   "mode" : (container | remote | remoteContainer)
 *            container - execute tests in a docker container on this machine
 *            remote - execute tests on a remote machine, accessed via ssh
 *            remoteContainer - execute tets in a docker container, hosted on a remote machine, accessed via ssh
 *   "localSourcePath": root path of project on host machine
 *   "remoteHost": name/address of remote machine
 *   "remoteSourcePath": root path of project on remote machine (if ssh'ing to another box)
 *   "remoteTempFilesPath": where required files will be copied to on remote machine (if ssh'ing)
 *   "containerName": name of the container, used to ascertain it's id
 *   "containerSourcePath": the path that project sources is mapped to e.g. "/src"
 *   "containerTempFilesPath": where required files will be copied to on container instance
 *
 * @returns {{}} - config parsed from the config file path
 */
function loadConfigFile(path) {
	var config = {};

	if (!utils.isFileAccessible(path)) {
		throw new Error('Config file was not found at path ' + path);
	} else {
		try {
			var data = fs.readFileSync(path);
			config = JSON.parse(data);
		}
		catch (err) {
			console.log('Could not parse configFile')
			console.log(err);
		}
	}
	return config;
}

/**
 *
 * @param config {object} - config to validate
 * @param isRunning - only validates config required for actual test exeuction
 */
function validateConfig(config, isRunning) {
	var failureMessage = '';

	if (!config.ide) {
		failureMessage += '\n' + 'ide is not specified. Valid options are intellij';
	}

	if (!config.mode) {
		failureMessage += '\n' + 'mode is not specified. Valid options are container, remote or remoteContainer';
	}

	if (!config.mochaPath) {
		failureMessage += '\n' + 'mochaPath is not specified. Please supply the path to the mocha package on the target remote/container';
	}

	if (!config.localSourcePath) {
		failureMessage += '\n' + 'localSourcePath not specified';
	}

	if (config.mode === 'container' || config.mode === 'remoteContainer') {
		if (!config.containerSourcePath) {
			failureMessage += '\n' + 'containerSourcePath is required if using a container mode';
		}

		if (!config.containerName) {
			failureMessage += '\n' + 'containerName is required if using a container mode';
		}

		if (!config.containerTempFilesPath) {
			failureMessage += '\n' + 'containerTempFilesPath is required if using a container mode';
		}
	}

	if (config.mode === 'remote' || config.mode === 'remoteContainer') {
		if (!config.remoteSourcePath) {
			failureMessage += '\n' + 'remoteSourcePath is required if using a remote mode';
		}

		if (!config.remoteTempFilesPath) {
			failureMessage += '\n' + 'remoteTempFilesPath is required if using a remote mode';
		}

		if (!config.remoteHost) {
			failureMessage += '\n' + 'remoteHost is required if using a remote mode';
		}
	}

	if (failureMessage) {
		throw new Error('Error validating config file :' + failureMessage);
	}
}

module.exports = {
	loadConfigFile: loadConfigFile,
	validateConfig: validateConfig
};