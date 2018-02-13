const os = require('os');

const winston = require('winston');

const USAGE = 'usage: llama-file-sync <file>';

class ErrorHandler {
	constructor() {
		this.INVALID_CONFIG =
			USAGE + os.EOL + 'The supplied path to the configuration file does not point to a valid configuration file.';
		this.MISSING_CONFIG = USAGE + os.EOL + 'Must specify a configuration file when calling llama-file-sync.';
	}

	throwErrorAndSetExitCode(reason) {
		winston.error(reason);
		process.exitCode = 1;
	}
}

module.exports = new ErrorHandler();
