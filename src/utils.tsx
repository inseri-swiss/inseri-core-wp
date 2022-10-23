import { ParamItem } from './admin-panel/ParamsTable'
import xmlFormatter from 'xml-formatter'
import { __ } from '@wordpress/i18n'

const htmlEscapesMap: Record<string, string> = {
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

export const mapParamsToObject = (params: ParamItem[]): Record<string, string> => {
	return params
		.filter((i) => i.isChecked)
		.filter((i) => i.key || i.value)
		.reduce((acc, i) => ({ ...acc, [i.key]: i.value }), {})
}

export const mapObjectToParams = (obj: Record<string, string>): ParamItem[] => {
	return Object.keys(obj).map((key) => ({ key, value: obj[key], isChecked: true }))
}

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

export const BODY_TYPE_TO_CONTENT_TYPE: Record<string, string> = {
	text: 'text/plain',
	json: 'application/json',
	xml: 'application/xml',
	'form-urlencoded': 'application/x-www-form-urlencoded',
	'form-data': 'multipart/form-data',
} as any

export const getBodyTypeByContenType = (contentType?: string): string => {
	const contentTypeMap: Record<string, string> = {
		'application/x-www-form-urlencoded': 'form-urlencoded',
		'multipart/form-data': 'form-data',
		xml: 'xml',
		json: 'json',
		'text/': 'text',
		'image/': 'image',
	}

	const found = Object.keys(contentTypeMap).find((k) => contentType?.includes(k))
	if (found) {
		return contentTypeMap[found]
	}

	return 'raw'
}
