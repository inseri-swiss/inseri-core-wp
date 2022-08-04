const defaultConfig = require('@wordpress/scripts/config/webpack.config')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs')

const tsChecker = new ForkTsCheckerWebpackPlugin({
	typescript: { diagnosticOptions: { semantic: true, syntactic: true } },
})

const blockEntrypoints = fs.readdirSync('./src/blocks').reduce(
	(accumulator, item) => ({
		...accumulator,
		[`blocks/${item}/index`]: `./src/blocks/${item}`,
	}),
	{}
)

module.exports = {
	...defaultConfig,
	entry: { ...blockEntrypoints },
	plugins: [...defaultConfig.plugins, tsChecker],
}
