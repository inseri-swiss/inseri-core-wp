<?php
namespace inseri_core;

function setup_datasources_table() {
	global $wpdb;
	$table_name = $wpdb->prefix . 'inseri_datasources';
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE $table_name (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      description VARCHAR(128) NOT NULL,
      method VARCHAR(12) NOT NULL,
      url VARCHAR(255) NOT NULL,
      headers JSON DEFAULT NULL,
      query_params JSON DEFAULT NULL,
      content_type VARCHAR(64) DEFAULT NULL,
      body MEDIUMTEXT DEFAULT NULL,
      UNIQUE KEY id (id)
    ) $charset_collate;";

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta($sql);
}
