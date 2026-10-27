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
						// keep import/export so bundlers get real ES modules
						modules: false,
						// no polyfills (no useBuiltIns/corejs): the library needs only Proxy, WeakMap and classes, anything else is up to the consumer
						targets: {
							esmodules: true
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
