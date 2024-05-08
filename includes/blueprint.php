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
		'steps' => [],
	];

	public function generate($steps) {
		$php_version = explode('.', phpversion());
		$this->blueprint['preferredVersions']['php'] = $php_version[0] . '.' . $php_version[1];

		$wp_version = explode('.', get_bloginfo('version'));
		$this->blueprint['preferredVersions']['wp'] = $wp_version[0] . '.' . $wp_version[1];
		if (!is_numeric($wp_version[1])) {
			$this->blueprint['preferredVersions']['wp'] = 'nightly';
		}

		if ($steps['login'] ?? true) {
			$this->add_login_step();
		}
		if ($steps['theme'] ?? true) {
			$this->add_theme_installations_steps();
		}
		if ($steps['plugins'] ?? true) {
			$this->add_plugins_installations_steps();
		}
		if ($steps['options'] ?? true) {
			$this->add_option_steps();
		}

		return $this->blueprint;
	}

	protected function add_login_step() {
		$this->blueprint['steps'][] = [
			'step' => 'login',
			'username' => 'admin',
			'password' => 'password',
		];
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

	protected function add_option_steps() {
		$options = wp_load_alloptions();

		// Prevent some special cases.
		foreach (
			[
				'active_plugins',
				'auth_key',
				'auth_salt',
				'cron',
				'home',
				'https_detection_errors',
				'initial_db_version',
				'logged_in_key',
				'logged_in_salt',
				'mailserver_url',
				'mailserver_login',
				'mailserver_pass',
				'mailserver_port',
				'new_admin_email',
				'recently_activated',
				'recovery_keys',
				'rewrite_rules',
				'siteurl',
				'site_icon',
				'site_logo',
				'theme_switched',
			]
			as $key
		) {
			unset($options[$key]);
		}

		foreach ($options as $key => $option) {
			if (strpos($key, '_transient') === 0 || strpos($key, '_site_transient') === 0) {
				unset($options[$key]);
				continue;
			}

			if ($option === '' || $option === []) {
				unset($options[$key]);
			}
		}

		$i = 1;
		$j = 1;
		foreach ($options as $key => $option) {
			$options_chunks[$j][$key] = $option;
			++$i;
			if ($i > 10) {
				++$j;
				$i = 1;
			}
		}

		foreach ($options_chunks as $chunk) {
			$this->blueprint['steps'][] = [
				'step' => 'setSiteOptions',
				'options' => $chunk,
			];
		}
	}
}
