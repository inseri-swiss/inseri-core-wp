//eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@playwright/test'

const baseConfig = require('@wordpress/scripts/config/playwright.config.js')
const config = defineConfig({
	...baseConfig,
	expect: {
		...baseConfig.expect,
		timeout: 10_000,
	},
})
export default config
