<?php

namespace inseri_core;

if (!function_exists('\plugins_api')) {
	require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
}

if (!function_exists('themes_api')) {
	require_once ABSPATH . 'wp-admin/includes/theme.php';
}

class Builder {
	public $blueprint = [
		'$schema' => 'https://playground.wordpress.net/blueprint-schema.json',
		'preferredVersions' => [
			'php' => '',
			'wp' => '',
		],
		'features' => [
			'networking' => true,
		],
		'phpExtensionBundles' => ['kitchen-sink'],
		'landingPage' => '/wp-admin/',
		'login' => true,
		'steps' => [
			[
				'step' => 'runPHP',
				'code' => "<?php include 'wordpress/wp-load.php'; wp_delete_post(1,true); ?>",
			],
			[
				'step' => 'installPlugin',
				'pluginZipFile' => [
					'resource' => 'wordpress.org/plugins',
					'slug' => 'wordpress-importer',
				],
				'options' => [
					'activate' => true,
				],
			],
		],
	];

	public function generate($steps) {
		$php_version = explode('.', phpversion());
		$this->blueprint['preferredVersions']['php'] = $php_version[0] . '.' . $php_version[1];

		$wp_version = explode('.', get_bloginfo('version'));
		$this->blueprint['preferredVersions']['wp'] = $wp_version[0] . '.' . $wp_version[1];
		if (!is_numeric($wp_version[1])) {
			$this->blueprint['preferredVersions']['wp'] = 'nightly';
		}

		if ($steps['theme'] ?? true) {
			$this->add_theme_installations_steps();
		}
		if ($steps['plugins'] ?? true) {
			$this->add_plugins_installations_steps();
		}

		return $this->blueprint;
	}

	protected function add_theme_installations_steps() {
		$theme_object = wp_get_theme();
		$version = $theme_object->get('Version');
		$slug = $theme_object->get_template();

		$data = \themes_api('theme_information', [
			'slug' => $slug,
			'fields' => [
				'rating' => false,
				'tags' => false,
				'sections' => false,
				'versions' => true,
			],
		]);

		if ($data instanceof \WP_Error || !isset($data->versions[$version])) {
			return;
		}

		$this->blueprint['steps'][] = [
			'step' => 'installTheme',
			'themeZipFile' => [
				'resource' => 'url',
				'url' => $data->versions[$version],
			],
			'options' => [
				'activate' => true,
			],
		];
	}

	protected function add_plugins_installations_steps() {
		foreach ($this->get_active_plugins() as $plugin) {
			$this->blueprint['steps'][] = [
				'step' => 'installPlugin',
				'pluginZipFile' => [
					'resource' => 'url',
					'url' => $plugin['link'],
				],
				'options' => [
					'activate' => true,
				],
			];
		}
	}

	protected function get_active_plugins() {
		$plugins = get_option('active_plugins');
		$return_plugins = [];

		foreach ($plugins as $plugin) {
			$plugin_version = get_file_data(WP_PLUGIN_DIR . '/' . $plugin, ['Version'], 'plugin')[0];
			$slug = explode('/', $plugin)[0];

			$data = \plugins_api('plugin_information', [
				'slug' => $slug,
				'fields' => [
					'rating' => false,
					'tags' => false,
					'sections' => false,
					'contributors' => false,
					'versions' => true,
				],
			]);

			if ($data instanceof \WP_Error || !isset($data->versions[$plugin_version])) {
				continue;
			}

			$return_plugins[] = [
				'slug' => $slug,
				'link' => $data->versions[$plugin_version],
			];
		}

		return $return_plugins;
	}
}
