<?php

namespace inseri_core;

require_once plugin_dir_path(__FILE__) . 'export.php';

const OPTION_KEY = 'inseri-core-export-enabled';

class RestApi {
	private $builder;

	public static function xml_rest_pre_serve_request($served, $result, $request, $server) {
		if (substr($request->get_route(), 0, 19) !== '/inseri-core/v1/wxr' || 401 === $result->get_status()) {
			return $served;
		}

		$server->send_header('Content-Type', 'text/xml');

		echo $result->get_data();
		$served = true;

		return $served;
	}

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
		register_rest_route('inseri-core/v1', '/blueprint/', [
			'methods' => 'GET',
			'callback' => [$this, 'get_blueprint_json'],
			'permission_callback' => '__return_true', // Allows public access
		]);

		register_rest_route('inseri-core/v1', '/wxr/(?P<post_id>\d+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_wxr'],
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

	public function get_blueprint_json($request) {
		$params = $request->get_params();
		$data = $this->builder->generate($params);

		$response = new \WP_REST_Response($data, 200, [
			'Access-Control-Allow-Origin' => '*',
		]);
		return $response;
	}

	public function get_wxr($request) {
		$params = $request->get_params();

		ob_start();
		inseri_core_export_wp($params);
		$contents = ob_get_contents();
		ob_end_clean();

		return $contents;
	}
}
