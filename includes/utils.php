<?php
namespace inseri_core;

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
