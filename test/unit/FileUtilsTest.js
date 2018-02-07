const proxyquire = require('proxyquire');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('FileUtilsTest', () => {
	const sandbox = sinon.createSandbox();
	const mockReadFileSync = 'read';

	let mockFs, mockWinston, mockStatSync;

	let FileUtils;

	beforeEach(() => {
		mockStatSync = {
			isDirectory: sandbox.stub()
		};

		mockFs = {
			writeFileSync: sandbox.stub(),
			readFileSync: sandbox.stub().returns(mockReadFileSync),
			unlinkSync: sandbox.stub(),
			rmdirSync: sandbox.stub(),
			statSync: sandbox.stub().returns(mockStatSync)
		};

		mockWinston = {
			debug: sandbox.stub()
		};

		FileUtils = proxyquire('../../src/FileUtils', {
			'fs': mockFs,
			'winston': mockWinston
		});
	});

	afterEach(() => {
		sandbox.restore();
	});

	it('should read and write to copy', () => {
		const src = 'src';
		const dest = 'dest';

		FileUtils.copy(src, dest);

		sinon.assert.calledWith(mockFs.writeFileSync, dest, mockReadFileSync);
		sinon.assert.calledWith(mockFs.readFileSync, src, 'utf8');
	});

	it('should unlink the file', () => {
		const file = 'file';
    
		FileUtils.silentUnlink(file);

		sinon.assert.calledWith(mockFs.unlinkSync, file);
	});

	it('should log to debug if unlinking fails', () => {
		const file = 'file';
		mockFs.unlinkSync.throws();

		FileUtils.silentUnlink(file);

		sinon.assert.calledWith(mockFs.unlinkSync, file);
		sinon.assert.called(mockWinston.debug);
	});

	it('should remove the directory', () => {
		const dir = 'dir';

		FileUtils.silentRmdir(dir);

		sinon.assert.calledWith(mockFs.rmdirSync, dir);
	});

	it('should log to debug if removing directory fails', () => {
		const dir = 'dir';
		mockFs.rmdirSync.throws();

		FileUtils.silentRmdir(dir);

		sinon.assert.calledWith(mockFs.rmdirSync, dir);
		sinon.assert.called(mockWinston.debug);    
	});

	it('should remove the beginning of paths which are common', () => {
		const basePath = 'base/path';
		const filePath = 'file/path/text';
		const fullPath = `${basePath}/${filePath}`;

		const result = FileUtils.removeBasePath(basePath, fullPath);

		expect(result).to.equals(filePath);
	});
});