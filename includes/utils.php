<?php
namespace inseri_core;

function extend_upload_mimes($mimes) {
	$mimes['md|markdown'] = 'text/markdown';
	$mimes['htm|html'] = 'text/html';
	$mimes['py'] = 'text/x-python';
	$mimes['r'] = 'text/x-r';
	$mimes['js'] = 'text/javascript';
	$mimes['json'] = 'application/json';
	$mimes['jsonld'] = 'application/ld+json';
	$mimes['yml|yaml'] = 'application/x-yaml';
	$mimes['toml'] = 'application/toml';
	$mimes['sql'] = 'application/sql';
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
