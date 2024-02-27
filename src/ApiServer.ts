import { __ } from '@wordpress/i18n'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { handleBody } from './utils'

const MEDIA_ROUTE = 'wp/v2/media/'

export const callMediaFile = async (url: string, responseContentType: string): Promise<[string?, any?]> => {
	try {
		const mediaResponse = await axios.get<Blob>(url, { responseType: 'blob' })
		const responseBody = await handleBody(mediaResponse.data, responseContentType)

		return [undefined, responseBody]
	} catch (exception) {
		if (exception instanceof axios.AxiosError) {
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

		const response = await axios({
			method,
			url: urlObject.toString(),
			headers,
			data: body,
			responseType: 'blob',
		})

		const responseBody = await handleBody(response.data, responseContentType)

		return [undefined, responseBody]
	} catch (exception) {
		if (exception instanceof axios.AxiosError) {
			return [exception.message, undefined]
		}

		return ['Unknown error occurred', undefined]
	}
}

export const handleTryRequest = async (method: string, url: string, queryParams: Record<string, string>, headers: Record<string, string>, body: any) => {
	try {
		const urlObject = new URL(url)
		const queries = new URLSearchParams(queryParams)
		urlObject.search = queries.toString()

		const response = await axios({
			method,
			url: urlObject.toString(),
			headers,
			data: body,
			responseType: 'blob',
		})

		const status = `${response.status} ${response.statusText}`
		return [status, response.headers, response.data]
	} catch (exception) {
		if (exception instanceof axios.AxiosError && exception.response) {
			const response = exception.response
			const status = `${response.status} ${response.statusText}`
			return [status, response.headers, response.data]
		}

		if (exception instanceof axios.AxiosError) {
			return [exception.code, {}, '']
		}
	}

	return ['', {}, '']
}

const handleRequest = async <T>(action: () => Promise<AxiosResponse<T>>): Promise<[string?, T?]> => {
	try {
		const response = await action()
		return [undefined, response.data]
	} catch (exception) {
		if (exception instanceof axios.AxiosError && exception.response) {
			const { data, status, statusText } = exception.response
			let body = ''

			if (data.message) {
				body = data.message
			} else if (typeof data === 'string') {
				body = data
			} else {
				body = JSON.stringify(data)
			}

			const msg = `${status} ${statusText}: ${body}`
			return [msg, undefined]
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

export const getAllMedia = async (ids: number[]): Promise<[string?, Media[]?]> => {
	const url = new URL(inseriApiSettings.root + MEDIA_ROUTE)
	url.searchParams.append('include', ids.join(','))

	const action = () => axios.get<Media[]>(url.toString())
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

export const getZenodoRecord = async (recordId: string): Promise<[string?, ZenodoRecord?]> => {
	const action = () => axios.get<ZenodoRecord>(RECORD_ROUTE + recordId)
	return handleRequest(action)
}
