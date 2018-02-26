const fs = require('fs');

const winston = require('winston');

function copy(src, dest) {
	fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'));
}

function silentOperation(func) {
	try {
		func();
	} catch (e) {
		winston.debug(e);
	}
}

function silentUnlink(file) {
	silentOperation(() => fs.unlinkSync(file));
}

function silentRmdir(folder) {
	silentOperation(() => fs.rmdirSync(folder));
}

function removeBasePath(basePath, filePath) {
	const splitBasePath = basePath.split('/');
	const splitFilePath = filePath.split('/');

	const relativeFilePath = splitFilePath
		.reduce((accumulator, pathPart, index) => {
			if (pathPart !== splitBasePath[index]) {
				accumulator.push(pathPart);
			}
			return accumulator;
		}, [])
		.join('/');

	return relativeFilePath;
}

module.exports = {
	copy,
	silentUnlink,
	silentRmdir,
	removeBasePath,
};
