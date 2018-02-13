const expect = require('chai').expect;

const index = require('../../src/index');
const main = require('../../src/main');

describe('indexTest', () => {
	it('should export main.run as watch', () => {
		expect(index.watch).to.equal(main.run);
	});
});
