const os = require('os');

const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('ConfigurationTest', () => {
	const srcString = 'validSrc';
	const destString = 'validDest';
	const number = 0;
	const boolean = true;
	const object = {};
	const nullValue = null;
	const undefinedValue = undefined;
	const srcArrayStrings = ['validSrc', 'src', 'dab'];
	const arrayNotStrings = [0, 1];
	const arrayMix = [0, 'world'];
	const preserve = 'preserve';
	const oneWaySync = 'oneWaySync';

	const errorPrefix = `usage: llama-file-sync <file>${
		os.EOL
	}The supplied path to the configuration file does not point to a valid configuration file.${os.EOL}`;
	const errorSrc = '    config.src must be: string | string[]';
	const errorDest = '    config.dest must be: string';
	const errorStrategy = "    config.strategy must be: 'preserve' | 'oneWaySync'";
	const errorCleanDest = '    config.cleanDest must be: undefined | boolean';
	const errorFile = 'must be an existent file or directory';

	const sandbox = sinon.createSandbox();

	let mockFs;

	let defaultConfig, Configuration;

	function createConfig() {
		return new Configuration(defaultConfig);
	}

	beforeEach(() => {
		mockFs = {
			existsSync: sandbox.stub(),
		};
		Configuration = proxyquire('../../src/Configuration', {
			fs: mockFs,
		});

		defaultConfig = {
			src: srcArrayStrings,
			dest: destString,
			strategy: preserve,
		};
	});

	afterEach(() => {
		sandbox.restore();
	});

	describe('with string', () => {
		beforeEach(() => {
			mockFs.existsSync.returns(true);
		});

		it('should require the given path', () => {
			const config = new Configuration('../test/unit/resources/MockRequirement');

			expect(config.src.length).to.equal(1);
			expect(config.src[0]).to.equal('dab');
			expect(config.dest).to.equal('alsoDab');
			expect(config.cleanDest).to.equal(false);
			expect(config.strategy).to.equal('preserve');
		});
	});

	describe('with object', () => {
		it('should ignore any unneccessary properties', () => {
			mockFs.existsSync.returns(true);

			defaultConfig.notProperty = 'should not exist';

			const config = createConfig();

			expect(config).to.not.be.null;
			expect(config.notProperty).to.be.undefined;
		});

		describe('should be valid with', () => {
			beforeEach(() => {
				mockFs.existsSync.returns(true);
			});

			it('src: string', () => {
				defaultConfig.src = srcString;

				const config = createConfig();

				expect(config.src.length).to.equal(1);
				expect(config.src[0]).to.equal(srcString);
			});

			it('src: string[]', () => {
				const config = createConfig();

				expect(config.src).to.equal(srcArrayStrings);
			});

			it('dest: string', () => {
				const config = createConfig();

				expect(config.dest).to.equal(destString);
			});

			it('cleanDest: undefined', () => {
				defaultConfig.cleanDest = undefinedValue;

				const config = createConfig();

				expect(config.cleanDest).to.equal(false);
			});

			it('cleanDest: boolean', () => {
				defaultConfig.cleanDest = boolean;

				const config = createConfig();

				expect(config.cleanDest).to.equal(boolean);
			});

			it("strategy: 'preserve'", () => {
				const config = createConfig();

				expect(config.strategy).to.equal(preserve);
			});

			it("strategy: 'oneWaySync'", () => {
				defaultConfig.strategy = oneWaySync;

				const config = createConfig();

				expect(config.strategy).to.equal(oneWaySync);
			});
		});

		describe('should be invalid with', () => {
			beforeEach(() => {
				mockFs.existsSync.returns(true);
			});

			[number, boolean, object, nullValue, undefinedValue, arrayNotStrings, arrayMix].forEach(invalidValue => {
				it(`src: ${JSON.stringify(invalidValue)}`, () => {
					defaultConfig.src = invalidValue;

					expect(createConfig).to.throw(`${errorPrefix}${errorSrc}`);
				});
			});

			it('src: string but non-existant files', () => {
				mockFs.existsSync.returns(false);

				const errorSuffix = defaultConfig.src
					.reduce((accumulator, filePath) => {
						accumulator.push(`    ${filePath} ${errorFile}`);
						return accumulator;
					}, [])
					.join(os.EOL);

				expect(createConfig).to.throw(`${errorPrefix}${errorSuffix}`);
			});

			[number, boolean, object, nullValue, undefinedValue, srcArrayStrings, arrayNotStrings, arrayMix].forEach(
				invalidValue => {
					it(`dest: ${JSON.stringify(invalidValue)}`, () => {
						defaultConfig.dest = invalidValue;

						expect(createConfig).to.throw(`${errorPrefix}${errorDest}`);
					});
				}
			);

			it('src and dest: /same', () => {
				const filePath = '/same';
				defaultConfig.src = filePath;
				defaultConfig.dest = filePath;

				expect(createConfig).to.throw(
					`${errorPrefix}    config.src ${filePath} is the same as config.dest ${filePath}`
				);
			});

			[srcString, number, object, nullValue, srcArrayStrings, arrayNotStrings, arrayMix].forEach(invalidValue => {
				it(`cleanDest: ${JSON.stringify(invalidValue)}`, () => {
					defaultConfig.cleanDest = invalidValue;

					expect(createConfig).to.throw(`${errorPrefix}${errorCleanDest}`);
				});
			});

			[
				srcString,
				number,
				boolean,
				object,
				nullValue,
				undefinedValue,
				srcArrayStrings,
				arrayNotStrings,
				arrayMix,
			].forEach(invalidValue => {
				it(`strategy: ${JSON.stringify(invalidValue)}`, () => {
					defaultConfig.strategy = invalidValue;

					expect(createConfig).to.throw(`${errorPrefix}${errorStrategy}`);
				});
			});

			it('should show multiple errors', () => {
				defaultConfig.src = 5;
				defaultConfig.cleanDest = 5;

				expect(createConfig).to.throw(`${errorPrefix}${errorSrc}${os.EOL}${errorCleanDest}`);
			});
		});
	});
});
