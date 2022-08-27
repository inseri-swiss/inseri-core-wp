<?php
namespace inseri_core\db;

global $wpdb;
define('TABLE_NAME', $wpdb->prefix . 'inseri_datasources');

function setup_table() {
	global $wpdb;
	$charset_collate = $wpdb->get_charset_collate();

	$sql = sprintf(
		"CREATE TABLE %s (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      description VARCHAR(128) NOT NULL,
      method VARCHAR(12) NOT NULL,
      url VARCHAR(255) NOT NULL,
      headers JSON DEFAULT '{}',
      query_params JSON DEFAULT '{}',
      content_type VARCHAR(64) DEFAULT NULL,
      body MEDIUMTEXT DEFAULT NULL,
      UNIQUE KEY id (id)
    ) %s;",
		TABLE_NAME,
		$charset_collate
	);

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta($sql);
}

/**
 * if the db execution is successful 'Array(null, result)' is returned
 * otherwise 'Array(error_msg, null)' is returned
 */
function resolve_action($action) {
	global $wpdb;
	$wpdb->hide_errors();
	$result = $action($wpdb);

	$last_error = $wpdb->last_error;
	if (!empty($last_error)) {
		return [$last_error, null];
	}

	return [null, $result];
}

function get_all() {
	$action = function ($wpdb) {
		$sql = sprintf('SELECT * FROM %s;', TABLE_NAME);
		return $wpdb->get_results($sql);
	};

	return resolve_action($action);
}

function get_one($id) {
	$action = function ($wpdb) use ($id) {
		$sql = sprintf('SELECT * FROM %s WHERE id=%d;', TABLE_NAME, $id);
		return $wpdb->get_row($sql);
	};

	return resolve_action($action);
}

function insert_one($item) {
	$action = function ($wpdb) use ($item) {
		$rows_inserted = $wpdb->insert(TABLE_NAME, $item);
		if ($rows_inserted) {
			return $wpdb->insert_id;
		}

		return null;
	};

	return resolve_action($action);
}

function delete_one($id) {
	$action = function ($wpdb) use ($id) {
		return $wpdb->delete(TABLE_NAME, ['id' => $id]);
	};

	return resolve_action($action);
}

function update_one($item) {
	$action = function ($wpdb) use ($item) {
		return $wpdb->update(TABLE_NAME, $item, ['id' => $item['id']]);
	};

	return resolve_action($action);
}
