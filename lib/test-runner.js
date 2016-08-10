#!/usr/bin/env node

var fs = require('fs'),
	path = require('path'),
	childProcess = require('child_process'),
	configUtils = require('./config-utils.js'),
	utils = require('./utils'),
	containerUtils = require('./container-utils');

var config = configUtils.loadConfigFile(utils.getConfigFilePath(__dirname));
configUtils.validateConfig(config);

if (process.argv.length > 2 && process.argv[2] === 'loadContainer') {
	console.log('TEST-RUNNER - launching on container');
	containerUtils.executeTests(config);
} else {
	console.log('TEST-RUNNER - launching test locally');
	launchTests(config);
}

function launchTests(config) {
	var mochaCommand = path.resolve(config.targetSourcePath, config.mochaPath, 'bin/mocha');
	var args = [];

	if (config.useBabel) {
		args.push('--compilers', 'js:babel-register');
	}

	args.push('--ui', 'bdd');
	args.push('--reporter', config.reporterPath);

	if (config.recursive) {
		args.push('--recursive', config.recursive);
	}

	if (config.files) {
		args = args.concat(config.files);
	}

	var commandText = mochaCommand + ' ' + args.join(' ');
	console.log('executing : ', commandText);

	var child = childProcess.spawn(mochaCommand, args, {
		cwd: config.targetSourcePath
		// stdio: null
	});

	child.stdout.on('data', function (data) {
		var text = data.toString();
		text = text.replace(config.targetSourcePath, config.localSourcePath);
		console.log(text);
	});

	child.on('err', function (err) {
		console.error(err);
		throw new Error('error running test!');
	});

	child.on('exit', function (code) {
		console.log('finished with code', code);
	});
}

