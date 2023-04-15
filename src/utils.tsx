import { BaseBeaconState, ConsumerBeacon } from '@inseri/lighthouse'
import { __ } from '@wordpress/i18n'
import xmlFormatter from 'xml-formatter'
import { StateCreator } from 'zustand'
import { ParamItem } from './components/ParamsTable'

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

export const TEXTUAL_CONTENT_TYPES = [
	{ label: 'JSON', value: 'application/json' },
	{ label: 'XML', value: 'application/xml' },
	{ label: 'Text', value: 'text/plain' },
	{ label: 'HTML', value: 'text/html' },
	{ label: 'CSV', value: 'text/csv' },
	{ label: 'Markdown', value: 'text/markdown' },
	{ label: 'SVG', value: 'image/svg+xml' },
	{ label: 'Python', value: 'text/x-python' },
	{ label: 'R', value: 'text/x-r' },
	{ label: 'JavaScript', value: 'application/javascript' },
	{ label: 'TypeScript', value: 'application/typescript' },
	{ label: 'SQL', value: 'application/sql' },
	{ label: 'YAML', value: 'application/x-yaml' },
]

export const COMMON_CONTENT_TYPES = [
	...TEXTUAL_CONTENT_TYPES,
	{ label: 'GIF', value: 'image/gif' },
	{ label: 'JPEG', value: 'image/jpeg' },
	{ label: 'PNG', value: 'image/png' },
	{ label: 'WebP', value: 'image/webp' },
	{ label: 'TIFF', value: 'image/tiff' },
	{ label: 'PDF', value: 'application/pdf' },
	{ label: 'MP3', value: 'audio/mp3' },
	{ label: 'WebM (audio)', value: 'audio/webm' },
	{ label: 'MP4', value: 'video/mp4' },
	{ label: 'WebM (video)', value: 'video/webm' },
	{ label: 'MPEG', value: 'video/mpg' },
	{ label: 'Zip', value: 'application/zip' },
	{ label: 'TAR', value: 'application/x-tar' },
	{ label: 'GZip', value: 'application/gzip' },
	{ label: 'BZip2', value: 'application/x-bzip2' },
	{ label: '7-Zip', value: 'application/x-7z-compressed' },
	{ label: 'Form-urlencoded', value: 'application/x-www-form-urlencoded' },
	{ label: 'Form-data', value: 'multipart/form-data' },
]

export const CONTENT_TYPE_TO_EXT = [
	{ ext: 'json', value: 'application/json' },
	{ ext: 'xml', value: 'application/xml' },
	{ ext: 'txt', value: 'text/plain' },
	{ ext: 'html', value: 'text/html' },
	{ ext: 'csv', value: 'text/csv' },
	{ ext: 'md', value: 'text/markdown' },
	{ ext: 'svg', value: 'image/svg+xml' },
	{ ext: 'py', value: 'text/x-python' },
	{ ext: 'r', value: 'text/x-r' },
	{ ext: 'js', value: 'application/javascript' },
	{ ext: 'ts', value: 'application/typescript' },
	{ ext: 'sql', value: 'application/sql' },
	{ ext: 'yml', value: 'application/x-yaml' },
	{ ext: 'gif', value: 'image/gif' },
	{ ext: 'jpg', value: 'image/jpeg' },
	{ ext: 'png', value: 'image/png' },
	{ ext: 'webp', value: 'image/webp' },
	{ ext: 'tiff', value: 'image/tiff' },
	{ ext: 'pdf', value: 'application/pdf' },
	{ ext: 'mp3', value: 'audio/mp3' },
	{ ext: 'webm', value: 'audio/webm' },
	{ ext: 'mp4', value: 'video/mp4' },
	{ ext: 'webm', value: 'video/webm' },
	{ ext: 'mpg', value: 'video/mpg' },
	{ ext: 'zip', value: 'application/zip' },
	{ ext: 'tar', value: 'application/x-tar' },
	{ ext: 'gz', value: 'application/gzip' },
	{ ext: 'bz2', value: 'application/x-bzip2' },
	{ ext: '7z', value: 'application/x-7z-compressed' },
]

export const guessContentTypeByExtension = (extension: string) => {
	const found = CONTENT_TYPE_TO_EXT.find((data) => extension === data.ext)
	if (found) {
		return found.value
	}
	return undefined
}

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
		'text/html': 'html',
		'text/markdown': 'markdown',
		'application/x-r': 'r',
		python: 'python',
		javascript: 'javascript',
		typescript: 'typescript',
		sql: 'sql',
		yaml: 'yaml',
		xml: 'xml',
		json: 'json',
		'text/': 'text',
		'image/': 'image',
	}

	const found = Object.keys(contentTypeMap).find((k) => contentType?.includes(k))
	return found ? contentTypeMap[found] : undefined
}

export const isBeautifyType = (bodyType: string) => ['xml', 'json'].some((i) => i === bodyType)

type PersistToAttributesImpl = (
	initialState: StateCreator<Record<string, any>, [], []>,
	wpAttributes: {
		setAttributes: (attrs: Partial<Record<string, any>>) => void
		keysToSave: string[]
	}
) => StateCreator<Record<string, any>, [], []>

export const persistToAttributes: PersistToAttributesImpl =
	(config, { keysToSave, setAttributes }) =>
	(set, get, store) => {
		return config(
			(args) => {
				const oldVal = get()
				set(args)
				const newVal = get()

				const modifiedKeys = Object.keys(oldVal)
					.filter((k) => keysToSave.includes(k))
					.filter((k) => oldVal[k] !== newVal[k])

				const updateObj = modifiedKeys.reduce((acc, k) => ({ ...acc, [k]: newVal[k] }), {})
				if (Object.keys(updateObj).length > 0) {
					setAttributes(updateObj)
				}
			},
			get,
			store
		)
	}

export function updatePartially(state: any, modifier: any) {
	Object.entries(modifier).forEach(([key, value]) => {
		if (typeof value === 'object' && !Array.isArray(value) && value) {
			if (!state[key]) {
				state[key] = {}
			}

			updatePartially(state[key], value)
		} else {
			state[key] = value
		}
	})
}

export const HTTP_METHODS = [
	'GET',
	'HEAD',
	'POST',
	'PUT',
	'DELETE',
	'OPTIONS',
	'PATCH',
]

export const CONTENT_TYPE = 'Content-Type'

export const isFormType = (bodyType: string) => ['form-urlencoded', 'form-data'].some((i) => i === bodyType)
export const isTextType = (bodyType: string) => ['xml', 'json', 'text'].some((i) => i === bodyType)
export const createParamItem = () => ({ isChecked: true, key: '', value: '' })

// admin topbar has 99999
// admin sidebar has 9990
export const Z_INDEX_ABOVE_ADMIN = 100_000

const PY_KEYWORDS = [
	'False',
	'await',
	'else',
	'import',
	'pass',
	'None',
	'break',
	'except',
	'in',
	'raise',
	'True',
	'class',
	'finally',
	'is',
	'return',
	'and',
	'continue',
	'for',
	'lambda',
	'try',
	'as',
	'def',
	'from',
	'nonlocal',
	'while',
	'assert',
	'del',
	'global',
	'not',
	'with',
	'async',
	'elif',
	'if',
	'or',
	'yield',
]

const JS_KEYWORDS = [
	'abstract',
	'arguments',
	'await',
	'boolean',
	'break',
	'byte',
	'case',
	'catch',
	'char',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'double',
	'else',
	'enum',
	'eval',
	'export',
	'extends',
	'false',
	'final',
	'finally',
	'float',
	'for',
	'function',
	'goto',
	'if',
	'implements',
	'import',
	'in',
	'instanceof',
	'int',
	'interface',
	'let',
	'long',
	'native',
	'new',
	'null',
	'package',
	'private',
	'protected',
	'public',
	'return',
	'short',
	'static',
	'super',
	'switch',
	'synchronized',
	'this',
	'throw',
	'throws',
	'transient',
	'true',
	'try',
	'typeof',
	'var',
	'void',
	'volatile',
	'while',
	'with',
	'yield',
]

export function isVariableValid(name: string): boolean {
	if (/\s/g.test(name)) {
		return false
	}

	if (PY_KEYWORDS.includes(name) || JS_KEYWORDS.includes(name)) {
		return false
	}

	return true
}

export const isBeaconReady = (beacon: ConsumerBeacon, val: BaseBeaconState) => !beacon.key || val.status === 'ready'

export const handleBody = async (blob: Blob, contentType: string) => {
	let responseBody: any = blob

	if (contentType.includes('application/json')) {
		const textBlob = new Blob([responseBody])
		responseBody = JSON.parse(await textBlob.text())
	}

	const found = TEXTUAL_CONTENT_TYPES.filter((ct) => !ct.value.includes('json')).find((ct) => ct.value.includes(contentType))
	if (found || contentType.includes('text/') || contentType.includes('xml')) {
		const textBlob = new Blob([responseBody])
		responseBody = await textBlob.text()
	}

	return responseBody
}

export const PERSISTENT_IDS = ['DOI', 'ARK', 'URN', 'PURL']

export const getFormattedBytes = (size: number) => {
	const units = [
		'bytes',
		'kB',
		'MB',
		'GB',
		'TB',
	]

	let l = 0
	let n = size

	while (n >= 1000 && ++l) {
		n = n / 1000
	}

	return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]
}
