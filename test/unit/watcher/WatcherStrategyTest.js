const path = require('path');

const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');

describe('WatcherStrategyTest', () => {
	const eventNames = ['add', 'change', 'unlink', 'addDir', 'unlinkDir', 'error', 'ready', 'raw'];

	const sandbox = sinon.createSandbox();

	let watchedPath, eventTriggeringObject, eventTriggeringPath, destination, newFileDestination;
	let mockStatSync, mockFs, mockFileUtils, mockWinston, mockMkdirp, mockRimraf;

	let WatcherStrategy;

	beforeEach(() => {
		mockStatSync = {
			isDirectory: sandbox.stub(),
		};

		mockFs = {
			statSync: sandbox.stub().returns(mockStatSync),
		};

		mockFileUtils = {
			copy: sandbox.stub(),
			silentUnlink: sandbox.stub(),
			silentRmdir: sandbox.stub(),
			removeBasePath: sandbox.stub(),
		};

		mockWinston = {
			debug: sandbox.stub(),
			info: sandbox.stub(),
		};

		mockMkdirp = {
			sync: sandbox.stub(),
		};

		mockRimraf = {
			sync: sandbox.stub(),
		};

		WatcherStrategy = proxyquire('../../../src/watcher/WatcherStrategy', {
			fs: mockFs,
			'../FileUtils': mockFileUtils,
			winston: mockWinston,
			mkdirp: mockMkdirp,
			rimraf: mockRimraf,
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('where watched path is a file', () => {
		beforeEach(() => {
			mockStatSync.isDirectory.returns(false);

			watchedPath = 'nested/watched/path';
			eventTriggeringObject = 'triggered';
			eventTriggeringPath = `${watchedPath}/${eventTriggeringObject}`;
			destination = 'nested/destination';
			newFileDestination = path.join(destination, eventTriggeringObject);
		});

		describe('preserve', () => {
			let eventListeners;

			beforeEach(() => {
				eventListeners = WatcherStrategy.preserve(eventTriggeringPath, destination);
			});

			it('should return a map of event listeners', () => {
				eventNames.forEach(name => {
					expect(eventListeners.get(name)).to.be.a('function');
				});
			});

			it('should copy on add', () => {
				const add = eventListeners.get('add');

				add(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been added`);
				sinon.assert.calledWith(mockFileUtils.copy, eventTriggeringPath, newFileDestination);
			});

			it('should copy on change', () => {
				const change = eventListeners.get('change');

				change(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been changed`);
				sinon.assert.calledWith(mockFileUtils.copy, eventTriggeringPath, newFileDestination);
			});

			it('should make directory on addDir', () => {
				const addDir = eventListeners.get('addDir');

				addDir(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `Directory ${eventTriggeringObject} has been added`);
				sinon.assert.calledWith(mockMkdirp.sync, newFileDestination);
			});
		});

		describe('oneWaySync', () => {
			let eventListeners;

			beforeEach(() => {
				eventListeners = WatcherStrategy.oneWaySync(eventTriggeringPath, destination);
			});

			it('should return a map of event listeners', () => {
				eventNames.forEach(name => {
					expect(eventListeners.get(name)).to.be.a('function');
				});
			});

			it('should copy on add', () => {
				const add = eventListeners.get('add');

				add(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been added`);
				sinon.assert.calledWith(mockFileUtils.copy, eventTriggeringPath, newFileDestination);
			});

			it('should copy on change', () => {
				const change = eventListeners.get('change');

				change(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been changed`);
				sinon.assert.calledWith(mockFileUtils.copy, eventTriggeringPath, newFileDestination);
			});

			it('should delete on unlink', () => {
				const unlink = eventListeners.get('unlink');

				unlink(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been deleted`);
				sinon.assert.calledWith(mockFileUtils.silentUnlink, newFileDestination);
			});

			it('should make directory on addDir', () => {
				const addDir = eventListeners.get('addDir');

				addDir(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `Directory ${eventTriggeringObject} has been added`);
				sinon.assert.calledWith(mockMkdirp.sync, newFileDestination);
			});

			it('should delete directory on unlinkDir', () => {
				const unlinkDir = eventListeners.get('unlinkDir');

				unlinkDir(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `Directory ${eventTriggeringObject} has been deleted`);
				sinon.assert.calledWith(mockRimraf.sync, newFileDestination);
				sinon.assert.calledWith(mockFileUtils.silentRmdir, newFileDestination);
			});
		});
	});
	describe('where watched path is a file', () => {
		beforeEach(() => {
			mockStatSync.isDirectory.returns(true);

			watchedPath = 'nested/watched/path';
			eventTriggeringObject = 'triggered/path/to/file';
			eventTriggeringPath = `${watchedPath}/${eventTriggeringObject}`;
			destination = 'nested/destination';
			newFileDestination = path.join(destination, eventTriggeringObject);

			mockFileUtils.removeBasePath.returns(eventTriggeringObject);
		});

		describe('preserve', () => {
			let eventListeners;

			beforeEach(() => {
				eventListeners = WatcherStrategy.preserve(eventTriggeringPath, destination);
			});

			it('should return a map of event listeners', () => {
				eventNames.forEach(name => {
					expect(eventListeners.get(name)).to.be.a('function');
				});
			});

			it('should copy on add', () => {
				const add = eventListeners.get('add');

				add(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been added`);
				sinon.assert.calledWith(mockFileUtils.copy, eventTriggeringPath, newFileDestination);
			});

			it('should copy on change', () => {
				const change = eventListeners.get('change');

				change(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been changed`);
				sinon.assert.calledWith(mockFileUtils.copy, eventTriggeringPath, newFileDestination);
			});

			it('should make directory on addDir', () => {
				const addDir = eventListeners.get('addDir');

				addDir(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `Directory ${eventTriggeringObject} has been added`);
				sinon.assert.calledWith(mockMkdirp.sync, newFileDestination);
			});
		});

		describe('oneWaySync', () => {
			let eventListeners;

			beforeEach(() => {
				eventListeners = WatcherStrategy.oneWaySync(eventTriggeringPath, destination);
			});

			it('should return a map of event listeners', () => {
				eventNames.forEach(name => {
					expect(eventListeners.get(name)).to.be.a('function');
				});
			});

			it('should copy on add', () => {
				const add = eventListeners.get('add');

				add(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been added`);
				sinon.assert.calledWith(mockFileUtils.copy, eventTriggeringPath, newFileDestination);
			});

			it('should copy on change', () => {
				const change = eventListeners.get('change');

				change(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been changed`);
				sinon.assert.calledWith(mockFileUtils.copy, eventTriggeringPath, newFileDestination);
			});

			it('should delete on unlink', () => {
				const unlink = eventListeners.get('unlink');

				unlink(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `File ${eventTriggeringObject} has been deleted`);
				sinon.assert.calledWith(mockFileUtils.silentUnlink, newFileDestination);
			});

			it('should make directory on addDir', () => {
				const addDir = eventListeners.get('addDir');

				addDir(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `Directory ${eventTriggeringObject} has been added`);
				sinon.assert.calledWith(mockMkdirp.sync, newFileDestination);
			});

			it('should delete directory on unlinkDir', () => {
				const unlinkDir = eventListeners.get('unlinkDir');

				unlinkDir(eventTriggeringPath);

				sinon.assert.calledWith(mockWinston.info, `Directory ${eventTriggeringObject} has been deleted`);
				sinon.assert.calledWith(mockRimraf.sync, newFileDestination);
				sinon.assert.calledWith(mockFileUtils.silentRmdir, newFileDestination);
			});
		});
	});
});
