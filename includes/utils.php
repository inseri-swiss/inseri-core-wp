<?php
namespace inseri_core;

abstract class Either {
	/**
	 * Transforms Right value and flatten the nested Either
	 * @param callable $f right transformer
	 * @return Either
	 */
	abstract public function flatMap(callable $f): Either;

	/**
	 * Transforms inner Right value
	 * @param callable $f right transformer
	 * @return Either
	 */
	abstract public function map(callable $f): Either;

	/**
	 * Gets value without Either wrapper after applying transformers
	 * @param callable $f left transformer (use null for identity function)
	 * @param callable $g right transformer (use null for identity function)
	 * @return Left value or Right value
	 */
	abstract public function fold(?callable $f, ?callable $g);

	public static function Left($value): Either {
		return new Left($value);
	}
	public static function Right($value): Either {
		return new Right($value);
	}
}

class Left extends Either {
	private $value;

	function __construct($value) {
		$this->value = $value;
	}

	function flatMap(callable $f): Either {
		return $this;
	}
	function map(callable $f): Either {
		return $this;
	}

	function fold(?callable $f, ?callable $_) {
		if (isset($f)) {
			return $f($this->value);
		}
		return $this->value;
	}
}

class Right extends Either {
	private $value;

	function __construct($value) {
		$this->value = $value;
	}

	function flatMap(callable $f): Either {
		$mapped_value = $f($this->value);

		if ($mapped_value instanceof Either) {
			return $mapped_value;
		}

		return Either::Right($mapped_value);
	}

	function map(callable $f): Either {
		return Either::Right($f($this->value));
	}

	function fold(?callable $_, ?callable $f) {
		if (isset($f)) {
			return $f($this->value);
		}
		return $this->value;
	}
}

function get_blocks() {
	$path = plugin_dir_path(__FILE__) . '../build/blocks';
	$dir_items = scandir($path);
	$folders = array_filter($dir_items, function ($f) use ($path) {
		return $f !== '.' && $f !== '..' && is_dir("$path/$f");
	});
	$folders = array_map(function ($f) use ($path) {
		return "$path/$f";
	}, $folders);
	return $folders;
}
