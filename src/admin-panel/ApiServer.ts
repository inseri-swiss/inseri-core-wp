import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { ParamsObject } from '../utils'

declare const wpApiSettings: {
	root: string
	nonce: string
}

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
	headers: Record<string, string>
	query_params: Record<string, string>
	body?: string
}

export const fireRequest = async (method: string, url: string, queryParams: ParamsObject, headers: ParamsObject, body: any) => {
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

export const getAllItems = async (): Promise<AxiosResponse<Datasource[]>> => {
	return axios.get<Datasource[]>(wpApiSettings.root + ROUTE)
}

export const addNewItem = async (newItem: DatasourceWithoutId): Promise<AxiosResponse<Datasource>> => {
	return axios.post<Datasource>(wpApiSettings.root + ROUTE, newItem, { headers: { 'X-WP-Nonce': wpApiSettings.nonce } })
}
