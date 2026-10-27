module.exports = function (api) {
	api.cache.never();

	const presets = ['@babel/preset-env'];

	const env = {
		cjs: {
			presets: [
				[
					'@babel/preset-env',
					{
						// Babel 8 keeps import/export by default when the caller (@babel/cli) doesn't say it can't handle them
						modules: 'commonjs'
					}
				]
			]
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
		env
	};
};
