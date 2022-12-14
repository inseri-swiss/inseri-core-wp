<?php
/**
 * Plugin Name:       inseri core
 * Description:       inseri rocks :)
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            inseri swiss
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

require_once plugin_dir_path(__FILE__) . 'includes/utils.php';
require_once plugin_dir_path(__FILE__) . 'includes/db.php';
require_once plugin_dir_path(__FILE__) . 'includes/rest_api.php';
require_once plugin_dir_path(__FILE__) . 'includes/admin_panel.php';

global $wpdb;
$inseri_core_db = new Inseri_Core_DB($wpdb);
$inseri_core_rest = new Inseri_Core_Rest($inseri_core_db);

register_activation_hook(__FILE__, [$inseri_core_db, 'setup_table']);

/**
 * REST API
 */
add_action('rest_api_init', [$inseri_core_rest, 'register_api_routes']);

/**
 * main script
 */
add_action('init', function () {
	$asset_file_inseri = include plugin_dir_path(__FILE__) . 'build/inseri-core.asset.php';
	wp_register_script('inseri-core', plugins_url('build/inseri-core.js', __FILE__), $asset_file_inseri['dependencies'], $asset_file_inseri['version']);

	wp_localize_script('inseri-core', 'inseriApiSettings', [
		'root' => esc_url_raw(rest_url()),
		'nonce' => wp_create_nonce('wp_rest'),
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
 * Admin Panel
 */

add_action('init', 'Inseri_Core_Admin::register_ui_script');
add_action('admin_enqueue_scripts', 'Inseri_Core_Admin::load_script');
add_action('admin_menu', 'Inseri_Core_Admin::add_menu');

/**
 * Enable additional file MIMEs
 */
add_filter('upload_mimes', 'inseri_core\extend_upload_mimes');
add_filter('wp_check_filetype_and_ext', 'inseri_core\wp_check_filetype_and_ext', 10, 4);
