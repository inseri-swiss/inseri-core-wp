<?php

namespace inseri_core;

require_once plugin_dir_path(__FILE__) . 'export.php';

class RestApi {
	private $builder;

	public static function xml_rest_pre_serve_request($served, $result, $request, $server) {
		if ('/inseri-core/v1/wxr' !== $request->get_route()) {
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

	public function register_routes() {
		register_rest_route('inseri-core/v1', '/blueprint/', [
			'methods' => 'GET',
			'callback' => [$this, 'get_blueprint_json'],
			'permission_callback' => '__return_true', // Allows public access
		]);

		register_rest_route('inseri-core/v1', '/wxr/', [
			'methods' => 'GET',
			'callback' => [$this, 'get_wxr'],
			'permission_callback' => '__return_true', // Allows public access
		]);
	}

	public function get_blueprint_json($request) {
		$params = $request->get_query_params();
		$data = $this->builder->generate($params);

		$response = new \WP_REST_Response($data, 200, [
			'Content-Type' => 'application/json',
			'Access-Control-Allow-Origin' => '*',
		]);
		return $response;
	}

	public function get_wxr($request) {
		$params = $request->get_query_params();

		ob_start();
		inseri_core_export_wp($params);
		$contents = ob_get_contents();
		ob_end_clean();

		return $contents;
	}
}
