const babelParser = require('@babel/eslint-parser');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = [
	{
		ignores: ['esm/', 'lib/', 'coverage/', '**/*.ts']
	},
	prettierConfig,
	{
		languageOptions: {
			parser: babelParser,
			ecmaVersion: 2018
		},
		rules: {
			'comma-dangle': ['error', 'never'],
			'func-names': 0,
			'no-console': 'warn'
		}
	}
];
