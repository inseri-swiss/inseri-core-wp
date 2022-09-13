<?php
namespace inseri_core\db;

use inseri_core\Either;

function setup_table() {
	global $wpdb;
	$table_name = $wpdb->prefix . 'inseri_datasources';
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE $table_name (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      description VARCHAR(128) NOT NULL,
      method VARCHAR(12) NOT NULL,
      url VARCHAR(255) NOT NULL,
      headers JSON DEFAULT '{}',
      query_params JSON DEFAULT '{}',
      content_type VARCHAR(64) DEFAULT NULL,
      body MEDIUMTEXT DEFAULT NULL,
      UNIQUE KEY id (id)
    ) $charset_collate;";

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta($sql);
}

function resolve_action($action): Either {
	global $wpdb;
	$wpdb->hide_errors();
	$table_name = $wpdb->prefix . 'inseri_datasources';

	$result = $action($wpdb, $table_name);

	$last_error = $wpdb->last_error;
	if (!empty($last_error)) {
		return Either::Left($last_error);
	}

	if ($result === false) {
		return Either::Left('execution-failed');
	}

	if ($result === 0) {
		return Either::Left('not-modified');
	}

	if ($result === null) {
		return Either::Left('not-found');
	}

	return Either::Right($result);
}

function get_all(): Either {
	$action = fn($wpdb, $table_name) => $wpdb->get_results(
		"SELECT * FROM $table_name;"
	);
	return resolve_action($action);
}

function get_one($id): Either {
	$action = fn($wpdb, $table_name) => $wpdb->get_row(
		"SELECT * FROM $table_name WHERE id=$id;"
	);
	return resolve_action($action);
}

function insert_one($item): Either {
	$action = function ($wpdb, $table_name) use ($item) {
		$rows_inserted = $wpdb->insert($table_name, $item);
		if ($rows_inserted) {
			return $wpdb->insert_id;
		}

		return null;
	};

	return resolve_action($action);
}

function delete_one($id): Either {
	$action = fn($wpdb, $table_name) => $wpdb->delete($table_name, [
		'id' => $id,
	]);
	return resolve_action($action);
}

function update_one($item): Either {
	$action = fn($wpdb, $table_name) => $wpdb->update($table_name, $item, [
		'id' => $item['id'],
	]);
	return resolve_action($action);
}
