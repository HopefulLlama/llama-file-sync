const proxyquire = require('proxyquire');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('mainTest', () => {
	class MockConfiguration {
		constructor() {
			const props = getMockConfig();
			this.src = props.src;
			this.dest = props.dest;
			this.strategy = props.strategy;
			this.cleanDest = props.cleanDest;
		}
	}

	const sandbox = sinon.createSandbox();
	const mockValidConfig = {
		src: ['mock-folder', 'mock/nested/folder', 'mock-file.txt', 'mock/nested/file.txt'],
		dest: 'dest',
		strategy: 'preserve',
	};

	let mockMkdirp, mockRimraf, mockWinston, mockErrorHandler, mockWatcher, mockWatcherStrategy, getMockConfig;
	let main;

	beforeEach(() => {
		mockMkdirp = sandbox.stub();

		mockRimraf = sandbox.stub();

		mockWinston = {
			debug: sandbox.stub(),
			info: sandbox.stub(),
		};

		mockErrorHandler = {
			MISSING_CONFIG: 'missing config',
		};

		mockWatcherStrategy = {
			preserve: sandbox.stub().returns({}),
		};

		mockWatcher = {
			generateWatcher: sandbox.stub().returns({}),
		};

		main = proxyquire('../../src/main', {
			mkdirp: mockMkdirp,
			winston: mockWinston,
			rimraf: mockRimraf,
			'./ErrorHandler': mockErrorHandler,
			'./Configuration': MockConfiguration,
			'./watcher/Watcher': mockWatcher,
			'./watcher/WatcherStrategy': mockWatcherStrategy,
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('invalid configs', () => {
		const errorMessage = 'Mock config is mock invalid';
		beforeEach(() => {
			getMockConfig = () => {
				throw new Error(errorMessage);
			};
		});

		it('should throw an error if pathToConfig is undefined', () => {
			main.run(undefined, error => {
				expect(error).to.equal(mockErrorHandler.MISSING_CONFIG);
			});
		});

		it('should throw an error if reading the config failed', () => {
			main.run('doesnt_exists', error => {
				sinon.assert.called(mockWinston.debug);
				expect(error).to.equal(errorMessage);
			});
		});
	});

	describe('valid config', () => {
		beforeEach(() => {
			getMockConfig = () => {
				return mockValidConfig;
			};
		});

		it('should throw an error if mkdirp errors', () => {
			const error = 'error';
			mockMkdirp.yields(error);

			main.run('validConfig', receivedError => {
				expect(receivedError).to.equal(error);
			});
		});

		it('should return an array of watchers on success', () => {
			mockMkdirp.yields();

			main.run('validConfig', (error, watchers) => {
				mockValidConfig.src.forEach(filePath => {
					sinon.assert.calledWith(mockWatcherStrategy.preserve, filePath, mockValidConfig.dest);
					sinon.assert.calledWith(mockWatcher.generateWatcher, {}, filePath);
				});

				sinon.assert.calledWith(mockWinston.info, 'llama-file-sync initialized');

				expect(error).to.equal(undefined);
				expect(watchers.length).to.equal(mockValidConfig.src.length);
			});
		});

		it('should rimraf the destination if config.cleanDest is on', () => {
			mockValidConfig.cleanDest = true;

			main.run('validConfig', () => {
				sinon.assert.calledWith(mockRimraf.sync, mockValidConfig.dest);
				sinon.assert.callOrder(mockRimraf.sync, mockMkdirp.sync);
			});
		});

		it('should not rimraf the destination if config.cleanDest is off', () => {
			mockValidConfig.cleanDest = false;

			main.run('validConfig', () => {
				sinon.assert.notCalled(mockRimraf.sync);
			});
		});

		it('should not rimraf the destination if config.cleanDest is not set', () => {
			main.run('validConfig', () => {
				sinon.assert.notCalled(mockRimraf.sync);
			});
		});
	});
});
