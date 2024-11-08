const fs = require('fs')
const merge = require('@wordpress/env/lib/config/merge-configs')

const file = '.wp-env.json'

const oldConfigStr = fs.readFileSync(file, { encoding: 'utf8' })
const oldConfig = JSON.parse(oldConfigStr)

fs.rmSync(file)

const merged = merge(oldConfig, {
	core: process.env.INSERI_WP_CORE || null,
	phpVersion: process.env.INSERI_WP_PHP,
})

fs.writeFileSync(file, JSON.stringify(merged))
