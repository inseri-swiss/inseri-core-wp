import axios from 'axios'
import { __ } from '@wordpress/i18n'
import { handleRequest } from '../utils'

const ROUTE = 'inseri/v1/datasources/'

export type Datasource = DatasourceWithoutId & {
	id: number
	author: number
	author_name: string
}

export interface DatasourceWithoutId {
	description: string
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

export const getAllItems = async (): Promise<[string?, Datasource[]?]> => {
	const action = () => axios.get<Datasource[]>(inseriApiSettings.root + ROUTE)
	return handleRequest(action)
}

export const addNewItem = async (newItem: DatasourceWithoutId): Promise<[string?, Datasource?]> => {
	const action = () => axios.post<Datasource>(inseriApiSettings.root + ROUTE, newItem, { headers: { 'X-WP-Nonce': inseriApiSettings.nonce } })
	return handleRequest(action)
}

export const removeItem = async (id: number): Promise<[string?, Datasource?]> => {
	const action = () => axios.delete<Datasource>(inseriApiSettings.root + ROUTE + id, { headers: { 'X-WP-Nonce': inseriApiSettings.nonce } })
	return handleRequest(action)
}

export const getItem = async (id: number): Promise<[string?, Datasource?]> => {
	const action = () => axios.get<Datasource>(inseriApiSettings.root + ROUTE + id)
	return handleRequest(action)
}

export const updateNewItem = async (newItem: Datasource): Promise<[string?, Datasource?]> => {
	const action = () => axios.put<Datasource>(inseriApiSettings.root + ROUTE + newItem.id, newItem, { headers: { 'X-WP-Nonce': inseriApiSettings.nonce } })
	return handleRequest(action)
}
