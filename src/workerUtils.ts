import textMime from './textMIME.json'
import generalMime from './generalMIME.json'

export const TEXTUAL_CONTENT_TYPES = textMime.map(({ ext, ...rest }) => ({ ...rest }))
export const COMMON_CONTENT_TYPES = [...textMime, ...generalMime].map(({ ext, ...rest }) => ({ ...rest }))
export const CONTENT_TYPE_TO_EXT = [...textMime, ...generalMime].flatMap((item) => item.ext.map((e) => ({ ext: e, value: item.value })))

export const guessContentTypeByExtension = (extension: string) => {
	const found = CONTENT_TYPE_TO_EXT.find((data) => extension === data.ext)
	if (found) {
		return found.value
	}
	return undefined
}

const textualContentTypes = TEXTUAL_CONTENT_TYPES.map((t) => t.value)
const isTextualContentType = (c: string) => textualContentTypes.includes(c) || c.startsWith('text/')

export async function createFileRecord(files: any[], WORK_DIR: string, runtime: any): Promise<Record<string, [string, any]>> {
	const fileTriples: [string, string, any][] = await Promise.all(
		files.map(async (f) => {
			const path = WORK_DIR + f.name
			const ext = f.name.split('.')[1]
			const type = guessContentTypeByExtension(ext) ?? 'application/octet-stream'

			const uint8array = await runtime.FS.readFile(path)
			runtime.FS.unlink(path)

			let data: any = new Blob([uint8array], { type })

			if (isTextualContentType(type)) {
				data = await data.text()
			}
			if (ext === 'json') {
				data = JSON.parse(data)
			}

			return [f.name, type, data]
		})
	)

	return fileTriples.reduce((acc, [name, type, data]) => ({ ...acc, [name]: [type, data] }), {})
}
