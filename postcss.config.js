const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')
const autoprefixer = require('autoprefixer')
const prefixer = require('postcss-prefixer')

const ignoreClasses = [/wp-block-*/]

const maybePurgecss =
	process.env.NODE_ENV === 'production'
		? purgecss({
				content: ['build/**/*.html', 'build/**/*.js'],
				safelist: ignoreClasses,
		  })
		: null

const cssnanoInstance = cssnano({
	preset: [
		'default',
		{
			discardComments: {
				removeAll: true,
			},
		},
	],
})

module.exports = {
	plugins: [
		autoprefixer({ grid: true }),
		prefixer({ prefix: 'inseri-', ignore: ignoreClasses }),
		cssnanoInstance,
		maybePurgecss,
	],
}
