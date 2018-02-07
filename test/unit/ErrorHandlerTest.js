const os = require('os');

const winston = require('winston');

const sinon = require('sinon');
const expect = require('chai').expect;

const ErrorHandler = require('../../src/ErrorHandler');

describe('ErrorHandlerTest', () => {
	const sandbox = sinon.createSandbox();

	afterEach(() => {
		sandbox.restore();
	});

	describe('messages', () => {
		it('should have the right msesage for invalid config', () => {
			expect(ErrorHandler.INVALID_CONFIG).to.equal(`usage: llama-file-sync <file>${os.EOL}The supplied path to the configuration file does not point to a valid configuration file.`);
		});

		it('should have the right message for a missing config', () => {
			expect(ErrorHandler.MISSING_CONFIG).to.equal(`usage: llama-file-sync <file>${os.EOL}Must specify a configuration file when calling llama-file-sync.`);
		});
	});

	describe('throwErrorAndSetExitCode', () => {
		beforeEach(() => {
			winston.error = sandbox.spy();
		});

		it('should log the reason and set exit code to one', () => {
			const reason = 'reason';

			ErrorHandler.throwErrorAndSetExitCode(reason);

			sinon.assert.calledWith(winston.error, reason);
			expect(process.exitCode).to.equal(1);

			process.exitCode = 0;
		});
	});
});