import apiFetch from '@wordpress/api-fetch'

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

export const getData = async () => {
	const response = await apiFetch<Datasource[]>({ path: wpApiSettings.root + ROUTE })
	return response
}
