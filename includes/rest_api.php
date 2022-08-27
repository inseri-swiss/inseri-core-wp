<?php
namespace inseri_core\rest;

use inseri_core\db as db;

define('NS', 'inseri/v1');
define('ROUTE_DATASOURCES', '/datasources/');

function register_api_routes() {
	$routes = [
		// [method, endpoint_suffix, callback]
		['GET', '', 'get_all'],
		['GET', '(?P<id>[\d]+)', 'get_one'],
		['POST', '', 'post'],
		['PUT', '(?P<id>[\d]+)', 'put'],
		['DELETE', '(?P<id>[\d]+)', 'delete'],
	];

	foreach ($routes as $r) {
		register_rest_route(NS, ROUTE_DATASOURCES . $r[1], [
			'methods' => $r[0],
			'callback' => 'inseri_core\rest\\' . $r[2],
			'permission_callback' => '__return_true',
		]);
	}
}

function validate_datasource($body, $check_id = false) {
	$non_empty_fields = ['description', 'method', 'url'];

	if ($check_id) {
		array_push($non_empty_fields, 'id');
	}

	foreach ($non_empty_fields as $field) {
		if (empty($body[$field])) {
			return new \WP_Error(
				'missing_required_field',
				"missing required field: '$field'",
				[
					'status' => 400,
				]
			);
		}
	}

	return null;
}

/*
 * $either is expected to be 'Array(null, result)' or 'Array(error_msg, null)'
 */
function unpack_db_result($either, $successful_code = 200, $fail_code = 400) {
	if (!empty($either[0])) {
		return new \WP_REST_Response($either[0], $fail_code);
	}

	return new \WP_REST_Response($either[1], $successful_code);
}

function get_all($request) {
	$result = db\get_all();
	return unpack_db_result($result, 200, 500);
}

function get_one($request) {
	$id = $request['id'];
	$result = db\get_one($id);
	return unpack_db_result($result, 200, 404);
}

function post($request) {
	$body = $request->get_json_params();

	$validation_result = validate_datasource($body);
	if (is_wp_error($validation_result)) {
		return $validation_result;
	}

	$result = db\insert_one($body);
	if (!empty($result[0])) {
		return new \WP_REST_Response($result[0], 400);
	}

	$result = db\get_one($result[1]);
	return unpack_db_result($result, 201, 400);
}

function put($request) {
	$body = $request->get_json_params();

	$validation_result = validate_datasource($body, true);
	if (is_wp_error($validation_result)) {
		return $validation_result;
	}

	$result = db\update_one($body);
	if (!empty($result[0])) {
		return new \WP_REST_Response($result[0], 400);
	}

	$result = db\get_one($body['id']);
	return unpack_db_result($result, 200, 400);
}

function delete($request) {
	$id = $request['id'];
	$get_result = db\get_one($id);

	if (!empty($get_result[0])) {
		return new \WP_REST_Response($get_result[0], 404);
	}

	$result = db\delete_one($id);
	if (!empty($result[0])) {
		return new \WP_REST_Response($result[0], 500);
	}

	return new \WP_REST_Response($get_result[1], 200);
}
