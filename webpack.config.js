const defaultConfig = require('@wordpress/scripts/config/webpack.config')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts')
const fs = require('fs')

const tsChecker = new ForkTsCheckerWebpackPlugin({
	typescript: { diagnosticOptions: { semantic: true, syntactic: true } },
})

const initialEntrypoints = { global: './src/global.scss' }

const blockEntrypoints = fs.readdirSync('./src/blocks').reduce(
	(accumulator, item) => ({
		...accumulator,
		[`blocks/${item}/index`]: `./src/blocks/${item}`,
	}),
	initialEntrypoints
)

module.exports = {
	...defaultConfig,
	entry: { ...blockEntrypoints },
	plugins: [
		...defaultConfig.plugins,
		tsChecker,
		new RemoveEmptyScriptsPlugin(),
	],
}
