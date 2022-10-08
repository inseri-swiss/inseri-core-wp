import { ParamItem } from './admin-panel/ParamsTable'
import xmlFormatter from 'xml-formatter'
import { __ } from '@wordpress/i18n'

const htmlEscapesMap: ParamsObject = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
}

const XML_FORMAT_OPTION = {
	collapseContent: true,
	lineSeparator: '\n',
}

export const escapeHtml = (input: string): string => {
	return Object.keys(htmlEscapesMap).reduce((acc, search) => acc.replaceAll(search, htmlEscapesMap[search]), input)
}

export interface ParamsObject {
	[key: string]: string
}

export const mapParamsToObject = (params: ParamItem[]): ParamsObject =>
	params
		.filter((i) => i.isChecked)
		.filter((i) => i.key || i.value)
		.reduce((acc, i) => ({ ...acc, [i.key]: i.value }), {})

export const formatCode = (type: string, code: string): [string | null, string | null] => {
	if (type === 'json') {
		try {
			const formattedJson = JSON.stringify(JSON.parse(code), null, 2)
			return [null, formattedJson]
		} catch (exception) {
			return [__('invalid JSON', 'inseri-core'), null]
		}
	}

	if (type === 'xml') {
		try {
			const formattedXml = xmlFormatter(code, XML_FORMAT_OPTION)
			return [null, formattedXml]
		} catch (exception) {
			return [__('invalid XML', 'inseri-core'), null]
		}
	}

	return [null, null]
}

export const getPropertyCaseInsensitive = (object: any, key: string) => {
	const index = Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase()) as string
	return object[index]
}
