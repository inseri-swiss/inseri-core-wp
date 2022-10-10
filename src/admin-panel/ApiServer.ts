import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { ParamsObject } from '../utils'

declare const wpApiSettings: {
	root: string
	nonce: string
}

const ROUTE = 'inseri/v1/datasources/'

export interface Datasource {
	id: number
	description: string
	type: string
	author: number
	author_name: string
	method: string
	url: string
	headers: Record<string, string>
	query_params: Record<string, string>
	body?: string
}

export const fireRequest = async (method: string, url: string, queryParams: ParamsObject, headers: ParamsObject, body: any) => {
	const urlObject = new URL(url)
	const queries = new URLSearchParams(queryParams)
	urlObject.search = queries.toString()

	return axios({
		method,
		url: urlObject.toString(),
		headers,
		data: body,
		transformResponse: (i) => i, // do not transform json to js-object
	})
}

export const getData = async (): Promise<AxiosResponse<Datasource[]>> => {
	return axios.get<Datasource[]>(wpApiSettings.root + ROUTE)
}
