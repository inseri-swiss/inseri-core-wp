<?php

abstract class Inseri_Core_Admin {
	static $script_name = 'inseri-core-admin-panel-script';
	static $style_name = 'inseri-core-admin-panel-style';
	static $menu_slug = 'inseri-core-page';
	static $permission = 'publish_posts';

	static function register_ui_script() {
		$asset_file = include plugin_dir_path(__FILE__) .
			'../build/admin-panel.asset.php';

		wp_register_script(
			self::$script_name,
			plugins_url('../build/admin-panel.js', __FILE__),
			$asset_file['dependencies'],
			$asset_file['version']
		);

		wp_register_style(
			self::$style_name,
			plugins_url('../build/global.css', __FILE__)
		);
	}

	static function load_script($hook) {
		// Load only on ?page=inseri-core-page.
		if ('toplevel_page_' . self::$menu_slug !== $hook) {
			return;
		}

		wp_localize_script(self::$script_name, 'wpApiSettings', [
			'root' => esc_url_raw(rest_url()),
			'nonce' => wp_create_nonce('wp_rest'),
		]);

		wp_enqueue_script(self::$script_name);
		wp_enqueue_style(self::$style_name);
	}

	static function add_menu() {
		$icon = trim(file_get_contents(plugin_dir_path(__FILE__) . 'icon.b64'));

		add_menu_page(
			__('Datasources - Inseri', 'inseri-core'),
			'Inseri',
			self::$permission,
			self::$menu_slug,
			function () {
				?>
					<div id="inseri-core-root"></div>
			 	<?php
			},
			'data:image/svg+xml;base64,' . $icon,
			3
		);
	}
}
