const proxyquire = require('proxyquire');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('mainTest', () => {
	const sandbox = sinon.createSandbox();
	
	let mockMkdirp, mockWinston, mockErrorHandler, mockValidConfig, mockConfigReader, mockWatcher, mockWatcherStrategy;
	let main;

	beforeEach(() => {
		mockMkdirp = sandbox.stub();
		mockWinston = {
			error: sandbox.stub(),
			info: sandbox.stub()
		};
		
		mockErrorHandler = {
			MISSING_CONFIG: 'missing config',
			INVALID_CONFIG: 'invalid config'
		};
		
		mockValidConfig = {
			src: ['mock-folder', 'mock/nested/folder', 'mock-file.txt', 'mock/nested/file.txt'],
			dest: 'dest',
			strategy: 'preserve'
		};
		
		mockConfigReader = {
			read: sandbox.stub()
		};
		
		mockWatcherStrategy = {
			preserve: sandbox.stub().returns({})
		};
		
		mockWatcher = {
			generateWatcher: sandbox.stub().returns({})
		};
		
		main = proxyquire('../../src/main', {
			'mkdirp': mockMkdirp,
			'winston': mockWinston,
			'./ErrorHandler': mockErrorHandler,
			'./ConfigReader': mockConfigReader,
			'./watcher/Watcher': mockWatcher,
			'./watcher/WatcherStrategy': mockWatcherStrategy
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('invalid configs', () => {
		beforeEach(() => {
			mockConfigReader.read.throws('error');
		});

		it('should throw an error if pathToConfig is undefined', () => {
			main.run(undefined, (error) => {
				expect(error).to.equal(mockErrorHandler.MISSING_CONFIG);
			});
		});

		it('should throw an error if reading the config failed', () => {
			main.run('doesnt_exists', (error) => {
				sinon.assert.called(mockWinston.error);
				expect(error).to.equal(mockErrorHandler.INVALID_CONFIG);
			});
		});
	});

	describe('valid configs', () => {
		beforeEach(() => {
			mockConfigReader.read.returns(mockValidConfig);
		});
		
		it('should throw an error if mkdirp errors', () => {
			const error = 'error';
			mockMkdirp.yields(error);

			main.run('validConfig', (receivedError) => {
				expect(receivedError).to.equal(error);
			});
		});

		it('should return an array of watchers on success', () => {
			mockMkdirp.yields();

			main.run('validConfig', (error, watchers) => {
				mockValidConfig.src.forEach((filePath) => {
					sinon.assert.calledWith(mockWatcherStrategy.preserve, filePath, mockValidConfig.dest);
					sinon.assert.calledWith(mockWatcher.generateWatcher, {}, filePath);
				});

				sinon.assert.calledWith(mockWinston.info, 'llama-file-sync initialized');

				expect(error).to.equal(undefined);
				expect(watchers.length).to.equal(mockValidConfig.src.length);
			});
		});
	});
});