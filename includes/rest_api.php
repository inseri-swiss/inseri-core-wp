<?php
use inseri_core\Either;

class Inseri_Core_Rest {
	private $inseri_db;
	private $namespace = 'inseri/v1';
	private $base_route = '/datasources/';

	function __construct($inseri_db) {
		$this->inseri_db = $inseri_db;
	}

	function register_api_routes() {
		$routes = [
			// [method, endpoint_suffix, callback, permission capability]
			['GET', '', 'get_all', ''],
			['GET', '(?P<item_id>[\d]+)', 'get_one', ''],
			['POST', '', 'post', 'publish_posts'],
			['PUT', '(?P<item_id>[\d]+)', 'put', 'publish_posts'],
			['DELETE', '(?P<item_id>[\d]+)', 'delete', 'delete_others_posts'],
		];

		foreach ($routes as $r) {
			register_rest_route($this->namespace, $this->base_route . $r[1], [
				'methods' => $r[0],
				'callback' => [$this, $r[2]],
				'permission_callback' => fn($request) => $this->validate_permission($request, $r[0]),
			]);
		}
	}

	function validate_permission($request, $method): bool {
		switch (strtoupper($method)) {
			case 'GET':
				return true;
			case 'POST':
				return current_user_can('publish_posts');
			case 'PUT':
				$item_id = $request['item_id'];

				$handle_right = function ($item) {
					if ($item->author == get_current_user_id()) {
						return current_user_can('publish_posts');
					}

					return current_user_can('edit_others_posts');
				};

				return $this->inseri_db->get_one($item_id)->fold(fn($not_found) => true, $handle_right);

			case 'DELETE':
				$item_id = $request['item_id'];

				$handle_right = function ($item) {
					if ($item->author == get_current_user_id()) {
						return current_user_can('delete_posts');
					}

					return current_user_can('delete_others_posts');
				};

				return $this->inseri_db->get_one($item_id)->fold(fn($not_found) => true, $handle_right);

			default:
				return true;
		}
	}

	function validate_datasource($request, $check_id = false): Either {
		$body = $request->get_json_params();
		$non_empty_fields = ['description', 'type', 'method', 'url'];
		$json_fields = ['headers', 'query_params'];

		if ($check_id) {
			if ($request['item_id'] != $request->get_json_params()['id']) {
				return Either::Left('The id from URL does not match with id in body');
			}

			// remove author_name property so that db does not throw error
			unset($body['author_name']);
		}

		$missing_fields = array_filter($non_empty_fields, fn($field) => empty($body[$field]));

		if (empty($missing_fields)) {
			return Either::Right($body);
		}

		$error_msg = 'missing required field: ' . implode(', ', $missing_fields);
		return Either::Left($error_msg);
	}

	private function handle_left($value, $custom_codes = []) {
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
		return $this->inseri_db->get_all()->fold(fn($error) => $this->handle_left($error), fn($item) => new WP_REST_Response($item, 200));
	}

	function get_one($request) {
		$id = $request['item_id'];

		return $this->inseri_db->get_one($id)->fold(fn($error) => $this->handle_left($error), fn($item) => new WP_REST_Response($item, 200));
	}

	function post($request) {
		return $this->validate_datasource($request)
			->flatMap(function ($item) {
				$item['author'] = get_current_user_id();
				return $this->inseri_db->insert_one($item);
			})
			->flatMap(fn($new_id) => $this->inseri_db->get_one($new_id))
			->fold(fn($error) => $this->handle_left($error), fn($item) => new WP_REST_Response($item, 201));
	}

	function put($request) {
		$id = $request['item_id'];
		$custom_codes = ['not-modified' => ['successfully updated', 200]];

		return $this->validate_datasource($request, true)
			->flatMap(fn($incoming) => $this->inseri_db->get_one($id)->map(fn($_) => $incoming))
			->flatMap(fn($item) => $this->inseri_db->update_one($item))
			->fold(fn($error) => $this->handle_left($error, $custom_codes), fn($_) => new WP_REST_Response('successfully updated', 200));
	}

	function delete($request) {
		$id = $request['item_id'];

		return $this->inseri_db
			->get_one($id)
			->flatMap(fn($item) => $this->inseri_db->delete_one($id)->map(fn($_) => $item))
			->fold(fn($error) => $this->handle_left($error), fn($item) => new WP_REST_Response($item, 200));
	}
}
