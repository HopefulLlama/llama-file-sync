module.exports = {
	env: {
		es6: true,
		node: true,
		mocha: true,
	},
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	parserOptions: {
		ecmaVersion: 6,
	},
	rules: {
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'windows'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
		'prettier/prettier': [
			'warn',
			{
				useTabs: true,
				tabWidth: 2,
				singleQuote: true,
				trailingComma: 'es5',
				printWidth: 120,
			},
		],
	},
};
