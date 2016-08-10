var path = require('path'),
	utils = require('./utils.js'),
	Promise = require('./tiny-promise');


function getcontainerId(config) {
	console.log('getting Id for container named : ', config.containerName);
	return utils.executeCommand({
		cmd: 'docker',
		args: ['ps', '--filter="ancestor=' + config.containerName + '"', '-q'],
		isReturningOutput: true
	});
}


function copyFilesToContainer(containerId, config) {
	var source = config.remoteTempFilesPath;
	var destination = containerId + ':' + path.resolve(config.containerTempFilesPath, '..');

	return utils.executeCommand({
		cmd: 'docker',
		args: ['cp', source, destination],
		isShowingOutput: true
	});
}

function launchTestRunner(containerId, config) {
	var args = ['exec', containerId, getTestRunnerPath(config)];

	return utils.executeCommand({
		cmd: 'docker',
		args: args,
		isShowingOutput: true
	});
}

function createContainerTempFolder(containerId, config) {
	var promise = new Promise();

	utils.executeCommand({
		cmd: 'docker',
		args: ['exec', containerId, 'ls', '-d', config.containerTempFilesPath],
		isReturningOutput: true
	}).then(function (result) {
		if (result && result.startsWith(config.containerTempFilesPath)) {
			console.log('Container temp folder already exists');
			promise.resolve();
		} else {
			console.log('Creating container temp folder');
			utils.executeCommand({
				cmd: 'docker',
				args: ['exec', containerId, 'mkdir', config.containerTempFilesPath],
				isShowingOutput: true
			}).then(function () {
				promise.resolve();
			});
		}
	});

	return promise;
}

function executeTests(config) {
	getcontainerId(config)
		.then(function (id) {
			id = id.replace(/\n/gm, '');
			console.log('Copying files to container');
			createContainerTempFolder(id, config)
				.then(function () {
					copyFilesToContainer(id, config)
						.then(function () {
							console.log('Executing remote runner');
							launchTestRunner(id, config);
						});
				});
		});
}

function getTestRunnerPath(config) {
	return path.resolve(config.containerTempFilesPath, 'test-runner.js');
}


module.exports = {
	executeTests: executeTests
};
