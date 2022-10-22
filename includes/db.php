<?php
use inseri_core\Either;

class Inseri_Core_DB {
	private $wpdb;
	private $charset_collate;
	private $table_name;
	private $user_name;

	function __construct($wpdb) {
		$this->wpdb = $wpdb;
		$this->table_name = $wpdb->prefix . 'inseri_datasources';
		$this->user_table = $wpdb->prefix . 'users';
		$this->charset_collate = $wpdb->get_charset_collate();
	}

	function setup_table() {
		$sql = "CREATE TABLE $this->table_name (
				id INT UNSIGNED NOT NULL AUTO_INCREMENT,
				description VARCHAR(128) NOT NULL,
				type VARCHAR(64) NOT NULL,
				author BIGINT(20) UNSIGNED NOT NULL,
				method VARCHAR(12) NOT NULL,
				url VARCHAR(255) NOT NULL,
				headers JSON DEFAULT '{}',
				query_params JSON DEFAULT '{}',
				body MEDIUMTEXT DEFAULT NULL,
				UNIQUE KEY id (id)
				) $this->charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta($sql);
	}

	private function resolve_action($action): Either {
		$this->wpdb->hide_errors();
		$result = $action();

		$last_error = $this->wpdb->last_error;
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
		$sql = "SELECT datasources.*, users.user_nicename AS author_name
				FROM $this->table_name AS datasources
				LEFT JOIN $this->user_table AS users
				on datasources.author = users.id;";

		$action = fn() => $this->wpdb->get_results($sql);
		return $this->resolve_action($action);
	}

	function get_one($id): Either {
		$sql = "SELECT datasources.*, users.user_nicename AS author_name
				FROM $this->table_name AS datasources
				LEFT JOIN $this->user_table AS users
				on datasources.author = users.id
				WHERE datasources.id=$id;";

		$action = fn() => $this->wpdb->get_row($sql);
		return $this->resolve_action($action);
	}

	function insert_one($item): Either {
		$action = function () use ($item) {
			$rows_inserted = $this->wpdb->insert($this->table_name, $item);
			if ($rows_inserted) {
				return $this->wpdb->insert_id;
			}

			return null;
		};

		return $this->resolve_action($action);
	}

	function delete_one($id): Either {
		$action = fn() => $this->wpdb->delete($this->table_name, ['id' => $id]);
		return $this->resolve_action($action);
	}

	function update_one($item): Either {
		$action = fn() => $this->wpdb->update($this->table_name, $item, ['id' => $item['id']]);
		return $this->resolve_action($action);
	}
}
