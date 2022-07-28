const defaultConfig = require("@wordpress/scripts/config/webpack.config");

module.exports = {
	...defaultConfig,
	entry: {
		"blocks/core/index": "./src/blocks/core",
	},
};
