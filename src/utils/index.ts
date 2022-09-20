import { __ } from '@wordpress/i18n'

export function i18n(parts: TemplateStringsArray, ..._keys: any[]) {
	return __(parts.join(''), 'inseri-core') // eslint-disable-line
}
