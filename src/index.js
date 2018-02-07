const main = require('./main');
const ErrorHandler = require('./ErrorHandler');

if (require.main === module) {
	const pathToConfig = process.argv[2];

	main.run(pathToConfig, (err) => {
		if(err) {
			ErrorHandler.throwErrorAndSetExitCode(err);
		}
	});
} else {
	module.exports = {
		watch: main.run
	};
}