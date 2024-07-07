<?php
namespace inseri_core;

function camelToKebab($camelCase) {
	$pattern = '/(?<=\\w)(?=[A-Z])|(?<=[a-z])(?=[0-9])/';
	$kebabCase = preg_replace($pattern, '-', $camelCase);
	return strtolower($kebabCase);
}

function extend_upload_mimes($mimes) {
	$mimes['py'] = 'text/x-python';
	$mimes['r'] = 'text/x-r';
	$mimes['json'] = 'application/json';
	$mimes['yml|yaml'] = 'application/x-yaml';
	$mimes['sql'] = 'application/sql';
	$mimes['md'] = 'text/markdown';
	$mimes['svg|svgz'] = 'image/svg+xml';

	return $mimes;
}

function wp_check_filetype_and_ext($data, $file, $filename, $mimes) {
	$filetype = wp_check_filetype($filename, $mimes);
	return [
		'ext' => $filetype['ext'],
		'type' => $filetype['type'],
		'proper_filename' => $data['proper_filename'],
	];
}

function get_asset_files() {
	$path = plugin_dir_path(__FILE__) . '../build/';
	$dir_items = scandir($path);
	$files = array_filter($dir_items, function ($f) use ($path) {
		$suffix = '.asset.php';
		$is_asset_file = substr($f, -strlen($suffix)) === $suffix;

		return $f !== '.' && $f !== '..' && $is_asset_file;
	});

	$files = array_map(function ($f) {
		$name = substr($f, 0, strrpos($f, '.asset.php'));
		return [camelToKebab($name), $name];
	}, $files);
	return $files;
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
