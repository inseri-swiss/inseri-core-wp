import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { __ } from '@wordpress/i18n'

const MEDIA_ROUTE = 'wp/v2/media/'
const INSERI_ROUTE = 'inseri/v1/datasources/'

export type Datasource = DatasourceWithoutId & {
	id: number
	author: number
	author_name: string
}

export interface DatasourceWithoutId {
	description: string
	content_type: string
	type: string
	method: string
	url: string
	headers: string
	query_params: string
	body?: string
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

export const getAllItems = async (): Promise<[string?, Datasource[]?]> => {
	const action = () => axios.get<Datasource[]>(inseriApiSettings.root + INSERI_ROUTE)
	return handleRequest(action)
}

export const addNewItem = async (newItem: DatasourceWithoutId): Promise<[string?, Datasource?]> => {
	const action = () => axios.post<Datasource>(inseriApiSettings.root + INSERI_ROUTE, newItem, { headers: { 'X-WP-Nonce': inseriApiSettings.nonce } })
	return handleRequest(action)
}

export const removeItem = async (id: number): Promise<[string?, Datasource?]> => {
	const action = () => axios.delete<Datasource>(inseriApiSettings.root + INSERI_ROUTE + id, { headers: { 'X-WP-Nonce': inseriApiSettings.nonce } })
	return handleRequest(action)
}

export const getItem = async (id: number): Promise<[string?, Datasource?]> => {
	const action = () => axios.get<Datasource>(inseriApiSettings.root + INSERI_ROUTE + id)
	return handleRequest(action)
}

export const updateNewItem = async (newItem: Datasource): Promise<[string?, Datasource?]> => {
	const action = () =>
		axios.put<Datasource>(inseriApiSettings.root + INSERI_ROUTE + newItem.id, newItem, { headers: { 'X-WP-Nonce': inseriApiSettings.nonce } })
	return handleRequest(action)
}

// it contains more properties
// but only properties of interest are added here
interface Media {
	id: number
	mime_type: string
	author: number
	date: string
	modified: string
	source_url: string
	title: { rendered: string }
}

export const getAllMedia = async (): Promise<[string?, Media[]?]> => {
	const action = () => axios.get<Media[]>(inseriApiSettings.root + MEDIA_ROUTE)
	return handleRequest(action)
}
