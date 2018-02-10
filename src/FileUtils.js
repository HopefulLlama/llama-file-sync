const fs = require('fs');

const winston = require('winston');

function copy(src, dest) {
	fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'));
}

function silentUnlink(file) {
	try {
		fs.unlinkSync(file);
	} catch(e) {
		winston.debug(e);
	}
}

function silentRmdir(folder) {
	try {
		fs.rmdirSync(folder);
	} catch(e) {
		winston.debug(e);
	}
}

function removeBasePath(basePath, filePath) {
	const splitBasePath = basePath.split('/');
	const splitFilePath = filePath.split('/');

	let relativeFilePath = splitFilePath.reduce((accumulator, pathPart, index) => {
		if(pathPart !== splitBasePath[index]) {
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
	removeBasePath
};