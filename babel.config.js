module.exports = function (api) {
	api.cache.never();

	const presets = ['@babel/preset-env'];

	const plugins = ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-object-rest-spread'];

	const env = {
		cjs: {
			presets: ['@babel/preset-env']
		},
		esm: {
			presets: [
				[
					'@babel/preset-env',
					{
						useBuiltIns: 'usage', // "usage" | "entry" | false, defaults to false.
						corejs: 3,
						targets: {
							esmodules: true,
							ie: '11'
						}
					}
				]
			]
		}
	};

	return {
		presets,
		plugins,
		env
	};
};
