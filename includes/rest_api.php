<?php

namespace inseri_core;

require_once plugin_dir_path(__FILE__) . 'export.php';
require_once plugin_dir_path(__FILE__) . 'readme.php';

const OPTION_KEY = 'inseri-core-export-enabled';

class RestApi {
	private $builder;

	public function __construct($builder) {
		$this->builder = $builder;
	}

	public function register_hooks() {
		add_action('rest_api_init', [$this, 'register_routes']);
	}

	public function can_publish() {
		return current_user_can('publish_posts');
	}

	public function can_export($request) {
		$params = $request->get_params();
		$data = get_option(OPTION_KEY, []);
		return in_array($params['post_id'], $data);
	}

	public function register_routes() {
		register_rest_route('inseri-core/v1', '/archive/(?P<post_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'make_zip'],
			'permission_callback' => [$this, 'can_export'],
		]);

		register_rest_route('inseri-core/v1', '/export-enabled/(?P<id>\d+)', [
			'methods' => 'POST',
			'callback' => [$this, 'add_post_id'],
			'permission_callback' => [$this, 'can_publish'],
		]);

		register_rest_route('inseri-core/v1', '/export-enabled/(?P<id>\d+)', [
			'methods' => 'DELETE',
			'callback' => [$this, 'remove_post_id'],
			'permission_callback' => [$this, 'can_publish'],
		]);
	}

	public function add_post_id($request) {
		$params = $request->get_params();
		$data = get_option(OPTION_KEY, []);

		if (!in_array($params['id'], $data)) {
			array_push($data, $params['id']);
			update_option(OPTION_KEY, $data);
		}

		return new \WP_REST_Response(null, 201);
	}

	public function remove_post_id($request) {
		$params = $request->get_params();

		$data = get_option(OPTION_KEY, []);
		$data = array_diff($data, [$params['id']]);
		update_option(OPTION_KEY, $data);

		return new \WP_REST_Response(null, 200);
	}

	private function get_blueprint($params) {
		return $this->builder->generate($params);
	}

	private function get_wxr($params) {
		ob_start();
		inseri_core_export_wp($params);
		$contents = ob_get_contents();
		ob_end_clean();

		return $contents;
	}

	private function get_readme($params, $blueprint) {
		ob_start();
		inseri_core_make_readme($params['post_id'], $blueprint);
		$contents = ob_get_contents();
		ob_end_clean();

		return $contents;
	}

	public function make_zip($request) {
		$params = $request->get_params();
		$blueprint = $this->get_blueprint($params);

		$upload_dir = wp_upload_dir();
		$unique_name = wp_unique_filename($upload_dir['basedir'], 'archive.zip');

		$file = path_join($upload_dir['basedir'], $unique_name);
		$zip = new \ZipArchive();

		if ($zip->open($file, \ZipArchive::CREATE) !== true) {
			return new \WP_Error('inseri_core_failed_zip', 'server cannot open zip file');
		}

		$zip->addFromString('post.xml', $this->get_wxr($params));
		$zip->addFromString('blueprint.json', wp_json_encode($blueprint, JSON_PRETTY_PRINT));
		$zip->addFromString('readme.md', $this->get_readme($params, wp_json_encode($blueprint)));
		$zip->close();

		header('Content-Disposition: attachment; filename=archive.zip;');
		header('Content-Type: application/zip');
		header('Content-Description: File Transfer');
		header('Content-Transfer-Encoding: binary');
		header('Content-Length: ' . filesize($file));

		echo file_get_contents($file);

		unlink($file);
		exit();
	}
}
