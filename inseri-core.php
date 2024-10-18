<?php
/**
 * Plugin Name:       inseri core
 * Description:       Scientific and Interactive Gutenberg Blocks to facilitate Open Science
 * Requires at least: 5.6
 * Requires PHP:      5.6
 * Version:           0.4.3
 * Author:            inseri.swiss
 * Author URI:        https://inseri.swiss
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       inseri-core
 *
 * @package           inseri
 *
 * inseri core is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * inseri core is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with inseri core.  If not, see <http://www.gnu.org/licenses/>.
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
	exit();
}

require_once plugin_dir_path(__FILE__) . 'includes/blueprint.php';
require_once plugin_dir_path(__FILE__) . 'includes/rest_api.php';
require_once plugin_dir_path(__FILE__) . 'includes/utils.php';

$inseri_core_blueprint_builder = new inseri_core\Builder();
$inseri_core_rest_api = new inseri_core\RestApi($inseri_core_blueprint_builder);

/**
 * main script
 */
add_action('init', function () {
	global $wp_scripts;

	$handle_path_pairs = [
		['inseri-core', 'inseri-core'],
		['inseri-core-editor', 'inseri-core-editor'],
		['inseri-core-python-worker', 'blocks/python/worker'],
		['inseri-core-javascript-worker', 'blocks/javascript/worker'],
	];
	foreach ($handle_path_pairs as [$handle, $path]) {
		$asset_file = include plugin_dir_path(__FILE__) . "build/{$path}.asset.php";
		wp_register_script($handle, plugins_url("build/{$path}.js", __FILE__), $asset_file['dependencies'], $asset_file['version']);
	}

	wp_localize_script('inseri-core', 'inseriApiSettings', [
		'root' => esc_url_raw(rest_url()),
		'nonce' => wp_create_nonce('wp_rest'),
		'pyWorker' => $wp_scripts->registered['inseri-core-python-worker']->src,
		'jsWorker' => $wp_scripts->registered['inseri-core-javascript-worker']->src,
	]);
});

/**
 * Blocks
 */
add_filter('block_categories_all', 'inseri_core_add_block_category');

function inseri_core_add_block_category($block_categories) {
	return array_merge(
		[
			[
				'slug' => 'inseri',
				'title' => 'inseri',
			],
		],
		$block_categories
	);
}

add_action('init', 'inseri_core_block_init');

function inseri_core_block_init() {
	$blocks = inseri_core\get_blocks();

	foreach ($blocks as $block) {
		register_block_type($block);
	}
}

/**
 * Enable additional file MIMEs
 */
add_filter('upload_mimes', 'inseri_core\extend_upload_mimes');
add_filter('wp_check_filetype_and_ext', 'inseri_core\wp_check_filetype_and_ext', 10, 4);

/**
 * REST API
 */
add_action('rest_api_init', [$inseri_core_rest_api, 'register_routes']);
