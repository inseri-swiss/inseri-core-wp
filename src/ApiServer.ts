import axios from 'axios'
import { handleRequest } from './utils'

const MEDIA_ROUTE = 'wp/v2/media/'

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
