const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');
const winston = require('winston');
const rimraf = require('rimraf');

const FileUtils = require('../FileUtils');

function noop() {}

function toPosix(filePath) {
	return filePath.replace('/\\/g', '/');
}

function withJustFileName(destinationPath, callback) {
	return filePath => {
		const splitFilePath = toPosix(filePath).split('/');
		const fileName = splitFilePath[splitFilePath.length - 1];

		callback(filePath, destinationPath, fileName);
	};
}

function withBasePathRemoved(sourcePath, destinationPath, callback) {
	return filePath => {
		const trimmedFilePath = FileUtils.removeBasePath(sourcePath, toPosix(filePath));
		callback(filePath, destinationPath, trimmedFilePath);
	};
}

function onAdd(filePath, destinationPath, relativeFilePath) {
	winston.info(`File ${relativeFilePath} has been added`);
	FileUtils.copy(filePath, path.join(destinationPath, relativeFilePath));
}

function onChange(filePath, destinationPath, relativeFilePath) {
	winston.info(`File ${relativeFilePath} has been changed`);
	FileUtils.copy(filePath, path.join(destinationPath, relativeFilePath));
}

function onAddDir(filePath, destinationPath, relativeFilePath) {
	winston.info(`Directory ${relativeFilePath} has been added`);
	mkdirp.sync(path.join(destinationPath, relativeFilePath));
}

const preserve = (sourcePath, destinationPath) => {
	let filePathManipulator = fs.statSync(sourcePath).isDirectory()
		? withBasePathRemoved.bind(null, sourcePath, destinationPath)
		: withJustFileName.bind(null, destinationPath);

	return new Map([
		['add', filePathManipulator(onAdd)],
		['change', filePathManipulator(onChange)],
		['unlink', noop],
		['addDir', filePathManipulator(onAddDir)],
		['unlinkDir', noop],
		['error', noop],
		['ready', noop],
		['raw', noop],
	]);
};

const oneWaySync = (sourcePath, destinationPath) => {
	let filePathManipulator = fs.statSync(sourcePath).isDirectory()
		? withBasePathRemoved.bind(null, sourcePath, destinationPath)
		: withJustFileName.bind(null, destinationPath);

	return new Map([
		['add', filePathManipulator(onAdd)],
		['change', filePathManipulator(onChange)],
		[
			'unlink',
			filePathManipulator((filePath, destinationPath, relativeFilePath) => {
				winston.info(`File ${relativeFilePath} has been deleted`);
				FileUtils.silentUnlink(path.join(destinationPath, relativeFilePath));
			}),
		],
		['addDir', filePathManipulator(onAddDir)],
		[
			'unlinkDir',
			filePathManipulator((filePath, destinationPath, relativeFilePath) => {
				winston.info(`Directory ${relativeFilePath} has been deleted`);
				rimraf.sync(path.join(destinationPath, relativeFilePath));
				// Sometimes rimraf fails to actually delete the root folder ???
				FileUtils.silentRmdir(path.join(destinationPath, relativeFilePath));
			}),
		],
		['error', noop],
		['ready', noop],
		['raw', noop],
	]);
};

module.exports = {
	preserve,
	oneWaySync,
};
