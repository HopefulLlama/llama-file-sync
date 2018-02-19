const os = require('os');

const winston = require('winston');

const USAGE = 'usage: llama-file-sync <file>';

class ErrorHandler {
	get INVALID_CONFIG() {
		return `${USAGE + os.EOL}The supplied path to the configuration file does not point to a valid configuration file.`;
	}

	get MISSING_CONFIG() {
		return `${USAGE + os.EOL}Must specify a configuration file when calling llama-file-sync.`;
	}

	throwErrorAndSetExitCode(reason) {
		winston.error(reason);
		process.exitCode = 1;
	}
}

module.exports = new ErrorHandler();
