const path = require('path');

const mkdirp = require('mkdirp');
const winston = require('winston');

const Watcher = require('./watcher/Watcher');
const WatcherStrategy = require('./watcher/WatcherStrategy');
const ErrorHandler = require('./ErrorHandler');
const ConfigReader = require('./ConfigReader');

function setup(pathToConfig, callback) {
	if(pathToConfig !== undefined) {
		let config;
		try {
			config = ConfigReader.read(path.resolve(process.cwd(), pathToConfig));
		} catch(error) {
			winston.error(error);
			callback(ErrorHandler.INVALID_CONFIG);
			return;
		}

		main(config, callback);
	} else {
		callback(ErrorHandler.MISSING_CONFIG);
	}
}

function main(config, callback) {
	config.src = Array.isArray(config.src) ? config.src : [config.src];

	mkdirp(config.dest, (mkdirpError) => {
		if(mkdirpError) {
			callback(mkdirpError);
		} else {
			const watchers = config.src.map((filePath) => {
				const strategy = WatcherStrategy[config.strategy](filePath, config.dest);
				return Watcher.generateWatcher(strategy, filePath);
			});

			winston.info('llama-file-sync initialized');
			callback(undefined, watchers);
		}
	});
}

module.exports = {
	run: setup
};