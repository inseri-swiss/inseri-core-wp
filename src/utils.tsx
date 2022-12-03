import { __ } from '@wordpress/i18n'
import xmlFormatter from 'xml-formatter'
import { ParamItem } from './admin-panel/ParamsTable'

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

export const formatCode = (type: string, code: string): [string?, string?] => {
	if (type === 'json') {
		try {
			const formattedJson = JSON.stringify(JSON.parse(code), null, 2)
			return [undefined, formattedJson]
		} catch (exception) {
			return [__('invalid JSON', 'inseri-core'), undefined]
		}
	}

	if (type === 'xml') {
		try {
			const formattedXml = xmlFormatter(code, XML_FORMAT_OPTION)
			return [undefined, formattedXml]
		} catch (exception) {
			return [__('invalid XML', 'inseri-core'), undefined]
		}
	}

	return []
}

export const getPropertyCaseInsensitive = (object: any, key: string) => {
	const index = Object.keys(object).find((k) => k.toLowerCase() === key.toLowerCase()) as string
	return object[index]
}

export const COMMON_CONTENT_TYPES = [
	{ label: 'Text', value: 'text/plain' },
	{ label: 'HTML', value: 'text/html' },
	{ label: 'JSON', value: 'application/json' },
	{ label: 'XML', value: 'application/xml' },
	{ label: 'SVG', value: 'image/svg+xml' },
	{ label: 'GIF', value: 'image/gif' },
	{ label: 'JPEG', value: 'image/jpeg' },
	{ label: 'PNG', value: 'image/png' },
	{ label: 'TIFF', value: 'image/tiff' },
	{ label: 'PDF', value: 'application/pdf' },
	{ label: 'MP3', value: 'audio/mp3' },
	{ label: 'MP4', value: 'video/mp4' },
	{ label: 'MPEG', value: 'video/mpg' },
	{ label: 'Zip', value: 'application/zip' },
	{ label: 'TAR', value: 'application/x-tar' },
	{ label: 'GZip', value: 'application/gzip' },
	{ label: 'BZip', value: 'application/x-bzip' },
	{ label: '7-Zip', value: 'application/x-7z-compressed' },
	{ label: 'Form-urlencoded', value: 'application/x-www-form-urlencoded' },
	{ label: 'Form-data', value: 'multipart/form-data' },
]

export const BODY_TYPE_TO_CONTENT_TYPE: Record<string, string> = {
	text: 'text/plain',
	json: 'application/json',
	xml: 'application/xml',
	'form-urlencoded': 'application/x-www-form-urlencoded',
	'form-data': 'multipart/form-data',
}

export const getBodyTypeByContenType = (contentType?: string): string | undefined => {
	const contentTypeMap: Record<string, string> = {
		'application/x-www-form-urlencoded': 'form-urlencoded',
		'multipart/form-data': 'form-data',
		xml: 'xml',
		json: 'json',
		'text/': 'text',
		'image/': 'image',
	}

	const found = Object.keys(contentTypeMap).find((k) => contentType?.includes(k))
	return found ? contentTypeMap[found] : undefined
}
