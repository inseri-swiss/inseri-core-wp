const defaultConfig = require('@wordpress/scripts/config/webpack.config')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const tsChecker = new ForkTsCheckerWebpackPlugin({
	typescript: { diagnosticOptions: { semantic: true, syntactic: true } },
})

module.exports = {
	...defaultConfig,
	entry: {
		'blocks/core/index': './src/blocks/core',
	},
	plugins: [...defaultConfig.plugins, tsChecker],
}
