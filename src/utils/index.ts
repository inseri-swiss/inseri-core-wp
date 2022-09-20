import { __ } from '@wordpress/i18n'

export function i18n(parts: TemplateStringsArray, ..._keys: any[]) {
	return __(parts.join(''), 'inseri-core') // eslint-disable-line
}

export function bulma(parts: TemplateStringsArray, ..._keys: any[]) {
	const regex = /([a-zA-Z0-9-]+)/g
	return parts.join('').replaceAll(regex, 'inseri-$1')
}
