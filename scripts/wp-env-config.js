const fs = require('fs')

const file = '.wp-env.json'

const oldConfigStr = fs.readFileSync(file, { encoding: 'utf8' })
const oldConfig = JSON.parse(oldConfigStr)

const merged = {
	...oldConfig,
	core: process.env.INSERI_WP_CORE || oldConfig.core || null,
	phpVersion: process.env.INSERI_WP_PHP || oldConfig.phpVersion,
}

fs.writeFileSync(file, JSON.stringify(merged))
