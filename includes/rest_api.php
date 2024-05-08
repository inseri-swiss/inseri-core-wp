<?php

namespace inseri_core;

class RestApi {
	private $builder;

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
}
