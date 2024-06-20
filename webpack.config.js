const defaultConfig = require('@wordpress/scripts/config/webpack.config')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

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
	'inseri-core': {
		import: './src/globalScript',
		library: {
			name: 'inseri',
			type: 'window',
		},
	},
	'inseri-core-editor': {
		import: './src/globalScript/editor',
		library: {
			name: 'inseriEditor',
			type: 'window',
		},
	},
}

const blockEntrypoints = fs.readdirSync('./src/blocks').reduce((accumulator, item) => {
	const worker = fs.existsSync(`./src/blocks/${item}/worker.ts`) ? { [`blocks/${item}/worker`]: `./src/blocks/${item}/worker` } : {}

	return {
		...accumulator,
		[`blocks/${item}/index`]: `./src/blocks/${item}`,
		[`blocks/${item}/hydration`]: `./src/blocks/${item}/hydration`,
		...worker,
	}
}, initialEntrypoints)

module.exports = {
	...defaultConfig,
	entry: { ...blockEntrypoints },
	plugins: [
		...defaultConfig.plugins,
		tsChecker,
		new BundleAnalyzerPlugin({ analyzerMode: process.env.STATS || 'disabled' }),
	],
	externals: [
		{ '@inseri/lighthouse': 'window.inseri.lighthouse' },
		{ '@inseri/utils': 'window.inseri.utils' },
	],
}
