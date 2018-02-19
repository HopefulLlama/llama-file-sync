const fs = require('fs');
const os = require('os');
const path = require('path');

const ErrorHandler = require('./ErrorHandler');

function cloneFromProperties(properties) {
	this.src = Array.isArray(properties.src) ? properties.src : [properties.src];
	this.dest = properties.dest;
	this.strategy = properties.strategy;
	this.cleanDest = properties.cleanDest !== undefined ? properties.cleanDest : false;
}

function validate() {
	const errorMessages = [
		{
			condition: this.src.every(filePath => typeof filePath === 'string'),
			errorMessage: '    config.src must be: string | string[]',
		},
		{
			condition: typeof this.dest === 'string',
			errorMessage: '    config.dest must be: string',
		},
		{
			condition: this.strategy === 'preserve' || this.strategy === 'oneWaySync',
			errorMessage: "    config.strategy must be: 'preserve' | 'oneWaySync'",
		},
		{
			condition: typeof this.cleanDest === 'boolean',
			errorMessage: '    config.cleanDest must be: undefined | boolean',
		},
	]
		.filter(element => element.condition === false)
		.map(element => element.errorMessage);

	if (errorMessages.length === 0) {
		this.src.reduce((accumulator, filePath) => {
			if (path.resolve(process.cwd(), filePath) === path.resolve(process.cwd(), this.dest)) {
				accumulator.push(`    config.src ${filePath} is the same as config.dest ${this.dest}`);
			}
			return accumulator;
		}, errorMessages);
	}

	if (errorMessages.length === 0) {
		this.src.reduce((accumulator, filePath) => {
			if (fs.existsSync(filePath) === false) {
				accumulator.push(`    ${filePath} must be an existent file or directory`);
			}
			return accumulator;
		}, errorMessages);
	}

	if (errorMessages.length > 0) {
		errorMessages.unshift(ErrorHandler.INVALID_CONFIG);
		throw new Error(errorMessages.join(os.EOL));
	}
}

module.exports = class Configuration {
	constructor(properties) {
		const configProperties = typeof properties === 'string' ? require(properties) : properties;
		cloneFromProperties.call(this, configProperties);
		validate.call(this);
	}
};
