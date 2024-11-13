const baseUrl = process.env.WP_BASE_URL ?? 'http://localhost:8889'

/*
 change first post id here
 in case it does not match anymore
 */
export enum Post {
	TextViewer_TextEditor = 9,
}

export function getPostUrl(id: Post) {
	return baseUrl + '/?p=' + id
}
