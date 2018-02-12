const path = require('path');

const expect = require('chai').expect;

const ConfigReader = require('../../src/ConfigReader');

describe('ConfigReaderTest', () => {
	it('should require the passed name', () => {
		const requirement = path.resolve(path.join(__dirname, 'resources', 'MockRequirement'));
		const resolution = ConfigReader.read(requirement);

		expect(resolution).to.equal('success');
	});
});