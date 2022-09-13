<?php
namespace inseri_core\rest;

use inseri_core\db as db;
use inseri_core\Either;
use \WP_REST_Response;

function register_api_routes() {
	$namespace = 'inseri/v1';
	$base_route = '/datasources/';

	$routes = [
		// [method, endpoint_suffix, callback]
		['GET', '', 'get_all'],
		['GET', '(?P<id>[\d]+)', 'get_one'],
		['POST', '', 'post'],
		['PUT', '(?P<id>[\d]+)', 'put'],
		['DELETE', '(?P<id>[\d]+)', 'delete'],
	];

	foreach ($routes as $r) {
		register_rest_route($namespace, $base_route . $r[1], [
			'methods' => $r[0],
			'callback' => 'inseri_core\rest\\' . $r[2],
			'permission_callback' => '__return_true',
		]);
	}
}

function validate_datasource($body, $check_id = false): Either {
	$non_empty_fields = ['description', 'method', 'url'];

	if ($check_id) {
		array_push($non_empty_fields, 'id');
	}

	$missing_fields = array_filter(
		$non_empty_fields,
		fn($field) => empty($body[$field])
	);

	if (empty($missing_fields)) {
		return Either::Right($body);
	}

	$error_msg = 'missing required field: ' . implode(', ', $missing_fields);
	return Either::Left($error_msg);
}

function handle_left($value, $custom_codes = []) {
	$default_codes = [
		'execution-failed' => ['internal server error', 500],
		'not-modified' => ['bad request', 400],
		'not-found' => ['not found', 404],
	];

	if (array_key_exists($value, $default_codes)) {
		$code = $custom_codes[$value] ?? $default_codes[$value];
		return new WP_REST_Response($code[0], $code[1]);
	}

	return new WP_REST_Response($value, 400);
}

function get_all($request) {
	return db\get_all()->fold(
		fn($error) => handle_left($error),
		fn($item) => new WP_REST_Response($item, 200)
	);
}

function get_one($request) {
	$id = $request['id'];

	return db\get_one($id)->fold(
		fn($error) => handle_left($error),
		fn($item) => new WP_REST_Response($item, 200)
	);
}

function post($request) {
	$body = $request->get_json_params();

	return validate_datasource($body)
		->flatMap(fn($item) => db\insert_one($item))
		->flatMap(fn($new_id) => db\get_one($new_id))
		->fold(
			fn($error) => handle_left($error),
			fn($item) => new WP_REST_Response($item, 201)
		);
}

function put($request) {
	$body = $request->get_json_params();
	$id = $body['id'];
	$custom_codes = ['not-modified' => ['successfully updated', 200]];

	return validate_datasource($body, true)
		->flatMap(fn($incoming) => db\get_one($id)->map(fn($_) => $incoming))
		->flatMap(fn($item) => db\update_one($item))
		->fold(
			fn($error) => handle_left($error, $custom_codes),
			fn($_) => new WP_REST_Response('successfully updated', 200)
		);
}

function delete($request) {
	$id = $request['id'];

	return db\get_one($id)
		->flatMap(fn($item) => db\delete_one($id)->map(fn($_) => $item))
		->fold(
			fn($error) => handle_left($error),
			fn($item) => new WP_REST_Response($item, 200)
		);
}
