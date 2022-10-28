const defaultConfig = require('@wordpress/scripts/config/webpack.config')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs')

const isProduction = process.env.NODE_ENV === 'production'
const configOverwrite = isProduction
	? {}
	: {
			compilerOptions: {
				strict: false,
				noUnusedLocals: false,
				noUnusedParameters: false,
			},
	  }

const tsChecker = new ForkTsCheckerWebpackPlugin({
	typescript: {
		diagnosticOptions: { semantic: true, syntactic: true },
		configOverwrite,
	},
})

const initialEntrypoints = {
	['inseri-core']: './src/mainScript',
	['admin-panel']: './src/admin-panel', // eslint-disable-line
}

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
	],
}
