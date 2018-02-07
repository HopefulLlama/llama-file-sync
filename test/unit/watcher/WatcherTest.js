const chokidar = require('chokidar');
const winston = require('winston');

const sinon = require('sinon');
const expect = require('chai').expect;

const Watcher = require('../../../src/watcher/Watcher');

describe('WatcherTest', () => {
	const sandbox = sinon.createSandbox();

	let watcher;
	beforeEach(() => {
		watcher = {
			on: sandbox.spy()
		};
		chokidar.watch = sandbox.stub().returns(watcher);
		winston.info = sandbox.spy();
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should generate a watcher, listening to a map of events and listener', () => {
		const eventListeners = new Map([
			['foo', () => {}],
			['bar', () => {}],
			['boom', () => {}]
		]);
		const filesToWatch = ['f1.txt', 'f2.txt', 'f3.txt'];

		const result = Watcher.generateWatcher(eventListeners, filesToWatch);

		sinon.assert.calledWith(chokidar.watch, filesToWatch);
		eventListeners.forEach((value, key) => {
			sinon.assert.calledWith(watcher.on, key, value);
		}); 
		sinon.assert.calledWith(winston.info, `Watching ${filesToWatch}`);
		
		expect(result).to.equal(watcher);
	});
});