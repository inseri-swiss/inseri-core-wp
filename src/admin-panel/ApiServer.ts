import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { __ } from '@wordpress/i18n'

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

export const fireRequest = async (method: string, url: string, queryParams: Record<string, string>, headers: Record<string, string>, body: any) => {
	try {
		const urlObject = new URL(url)
		const queries = new URLSearchParams(queryParams)
		urlObject.search = queries.toString()

		const response = await axios({
			method,
			url: urlObject.toString(),
			headers,
			data: body,
			transformResponse: (i) => i, // do not transform json to js-object
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
	}

	return ['', {}, '']
}

export const generalRequest = async <T>(action: () => Promise<AxiosResponse<T>>): Promise<[string?, T?]> => {
	try {
		const response = await action()
		return [undefined, response.data]
	} catch (exception) {
		if (exception instanceof axios.AxiosError && exception.response && exception.response.data.message) {
			const { data, status, statusText } = exception.response
			const msg = `${status} ${statusText}: ${data.message}`
			return [msg, undefined]
		}

		const msg = __('Refresh the page and try it again.', 'inseri-core')
		return [msg, undefined]
	}
}

export const getAllItems = async (): Promise<AxiosResponse<Datasource[]>> => {
	return axios.get<Datasource[]>(wpApiSettings.root + ROUTE)
}

export const addNewItem = async (newItem: DatasourceWithoutId): Promise<[string?, Datasource?]> => {
	const action = () => axios.post<Datasource>(wpApiSettings.root + ROUTE, newItem, { headers: { 'X-WP-Nonce': wpApiSettings.nonce } })
	return generalRequest(action)
}

export const removeItem = async (id: number): Promise<[string?, Datasource?]> => {
	const action = () => axios.delete<Datasource>(wpApiSettings.root + ROUTE + id, { headers: { 'X-WP-Nonce': wpApiSettings.nonce } })
	return generalRequest(action)
}

export const getItem = async (id: number): Promise<[string?, Datasource?]> => {
	const action = () => axios.get<Datasource>(wpApiSettings.root + ROUTE + id)
	return generalRequest(action)
}

export const updateNewItem = async (newItem: Datasource): Promise<[string?, Datasource?]> => {
	const action = () => axios.put<Datasource>(wpApiSettings.root + ROUTE + newItem.id, newItem, { headers: { 'X-WP-Nonce': wpApiSettings.nonce } })
	return generalRequest(action)
}
