<?php

abstract class Inseri_Core_Admin {
	static $script_name = 'inseri-core-admin-panel-script';
	static $style_name = 'inseri-core-admin-panel-style';
	static $top_menu_title = 'inseri';
	static $permission = 'publish_posts';

	static $top_menu_slug = 'inseri-core-page';
	static $add_new_menu_slug = 'inseri-core-add-new-page';

	static function register_ui_script() {
		$asset_file = include plugin_dir_path(__FILE__) . '../build/admin-panel.asset.php';

		wp_register_script(self::$script_name, plugins_url('../build/admin-panel.js', __FILE__), $asset_file['dependencies'], $asset_file['version']);
		wp_register_style(self::$style_name, plugins_url('../build/admin-panel.css', __FILE__));
	}

	static function load_script($hook) {
		$top_hook = 'toplevel_page_' . self::$top_menu_slug;
		$add_new_hook = strtolower(self::$top_menu_title) . '_page_' . self::$add_new_menu_slug;

		if ($top_hook !== $hook && $add_new_hook !== $hook) {
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
		$main_page_title = __('Data Sources - inseri', 'inseri-core');
		$render_root = function () {
			?>
				<div id="inseri-core-root"></div>
			<?php
		};

		add_menu_page($main_page_title, self::$top_menu_title, self::$permission, self::$top_menu_slug, $render_root, 'data:image/svg+xml;base64,' . $icon, 3);
		add_submenu_page(self::$top_menu_slug, $main_page_title, __('All Data Sources', 'inseri-core'), self::$permission, self::$top_menu_slug, $render_root);
		add_submenu_page(
			self::$top_menu_slug,
			__('Add New Data Source - inseri', 'inseri-core'),
			__('Add New', 'inseri-core'),
			self::$permission,
			self::$add_new_menu_slug,
			$render_root
		);
	}
}
