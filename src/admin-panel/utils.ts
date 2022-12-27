export const HTTP_METHODS = [
	'GET',
	'HEAD',
	'POST',
	'PUT',
	'DELETE',
	'OPTIONS',
	'PATCH',
]

export const PAGES = {
	home: 'inseri-core-page',
	'add-new': 'inseri-core-add-new-page',
}

export const CONTENT_TYPE = 'Content-Type'

export const isFormType = (bodyType: string) => ['form-urlencoded', 'form-data'].some((i) => i === bodyType)
export const isTextType = (bodyType: string) => ['xml', 'json', 'text'].some((i) => i === bodyType)
export const createParamItem = () => ({ isChecked: true, key: '', value: '' })
