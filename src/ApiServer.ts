import { __ } from '@wordpress/i18n'
import { handleBody } from './utils'

const MEDIA_ROUTE = 'wp/v2/media/'

export const callMediaFile = async (url: string, responseContentType: string): Promise<[string?, any?]> => {
	try {
		const response = await fetch(url)

		if (response.ok) {
			const blob = await response.blob()
			const responseBody = await handleBody(blob, responseContentType)
			return [undefined, responseBody]
		}

		return [response.statusText, undefined]
	} catch (exception) {
		if (exception instanceof Error) {
			return [exception.message, undefined]
		}

		return ['Unknown error occurred', undefined]
	}
}

export const fireWebApi = async (
	method: string,
	url: string,
	queryParams: Record<string, string>,
	headers: Record<string, string>,
	body: any,
	responseContentType: string
): Promise<[string?, any?]> => {
	try {
		const urlObject = new URL(url)
		const queries = new URLSearchParams(queryParams)
		urlObject.search = queries.toString()

		const response = await fetch(urlObject.toString(), { method, headers, body })

		if (response.ok) {
			const blob = await response.blob()
			const responseBody = await handleBody(blob, responseContentType)
			return [undefined, responseBody]
		}

		return [response.statusText, undefined]
	} catch (exception) {
		if (exception instanceof Error) {
			return [exception.message, undefined]
		}

		return ['Unknown error occurred', undefined]
	}
}

export const handleTryRequest = async (
	method: string,
	url: string,
	queryParams: Record<string, string>,
	headers: Record<string, string>,
	body: any
): Promise<[string, Headers, Blob]> => {
	try {
		const urlObject = new URL(url)
		const queries = new URLSearchParams(queryParams)
		urlObject.search = queries.toString()

		const response = await fetch(urlObject.toString(), { method, headers, body })
		const blob = await response.blob()
		const status = `${response.status} ${response.statusText}`

		return [status, response.headers, blob]
	} catch (exception) {
		if (exception instanceof Error) {
			return [exception.message, new Headers(), new Blob([''])]
		}
	}

	return ['', new Headers(), new Blob([''])]
}

type HandledResponse<T> = [undefined, T] | [string, undefined]
const handleRequest = async <T>(action: () => Promise<Response>): Promise<HandledResponse<T>> => {
	try {
		const response = await action()

		if (response.ok) {
			const responseBody = await response.json()
			return [undefined, responseBody]
		}

		return [response.statusText, undefined]
	} catch (exception) {
		if (exception instanceof Error) {
			return [exception.message, undefined]
		}

		return [__('Refresh the page and try it again.', 'inseri-core'), undefined]
	}
}

// it contains more properties
// but only properties of interest are added here
export interface Media {
	id: number
	mime_type: string
	author: number
	date: string
	modified: string
	source_url: string
	title: { rendered: string }
	media_details: {
		sizes: {
			full?: { source_url: string }
			medium?: { source_url: string }
			thumbnail?: { source_url: string }
		}
	}
}

export const getAllMedia = async (ids: number[]): Promise<HandledResponse<Media[]>> => {
	const url = new URL(inseriApiSettings.root + MEDIA_ROUTE)
	url.searchParams.append('include', ids.join(','))

	const action = () => fetch(url.toString())
	return handleRequest(action)
}

const RECORD_ROUTE = 'https://zenodo.org/api/records/'

// it contains more properties
// but only properties of interest are added here
interface ZenodoFile {
	key: string
	links: { self: string }
	size: number
}

export interface ZenodoRecord {
	created: string
	doi: string
	files: ZenodoFile[]
	metadata: {
		title: string
		version?: string
	}
}

export const getZenodoRecord = async (recordId: string): Promise<HandledResponse<ZenodoRecord>> => {
	const action = () => fetch(RECORD_ROUTE + recordId)
	return handleRequest(action)
}

const EXPORT_ENABLED_ROUTE = 'inseri-core/v1/export-enabled/'

export const enablePostExport = async (postId: number): Promise<HandledResponse<string>> => {
	const action = () =>
		fetch(inseriApiSettings.root + EXPORT_ENABLED_ROUTE + postId, {
			method: 'POST',
			headers: { 'X-WP-Nonce': inseriApiSettings.nonce },
			body: undefined,
		})
	return handleRequest(action)
}
export const disablePostExport = async (postId: number): Promise<HandledResponse<string>> => {
	const action = () =>
		fetch(inseriApiSettings.root + EXPORT_ENABLED_ROUTE + postId, {
			method: 'DELETE',
			headers: { 'X-WP-Nonce': inseriApiSettings.nonce },
		})
	return handleRequest(action)
}
