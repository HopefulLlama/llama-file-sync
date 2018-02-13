const chokidar = require('chokidar');
const winston = require('winston');

function generateWatcher(watcherStrategy, filesToWatch) {
	const watcher = chokidar.watch(filesToWatch);

	watcherStrategy.forEach((value, key) => {
		watcher.on(key, value);
	});

	winston.info(`Watching ${filesToWatch}`);

	return watcher;
}

module.exports = {
	generateWatcher,
};
