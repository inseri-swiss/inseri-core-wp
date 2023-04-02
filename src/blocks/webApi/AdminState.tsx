import { __ } from '@wordpress/i18n'
import { immer } from 'zustand/middleware/immer'
import { fireWebApi, handleTryRequest } from '../../ApiServer'
import {} from '../../components/DetailViewBody'
import { ParamItem } from '../../components/ParamsTable'
import {
	BODY_TYPE_TO_CONTENT_TYPE,
	CONTENT_TYPE,
	createParamItem,
	formatCode,
	getBodyTypeByContenType,
	getPropertyCaseInsensitive,
	isBeautifyType,
	isTextType,
	mapObjectToParams,
	mapParamsToObject,
	updatePartially,
} from '../../utils'
import { Attributes as BlockAttributes } from './index'

interface DatasourceAttributes extends BlockAttributes {
	openAccordionItems: string[]
	isContentTypeLock: boolean

	heading: {
		pageError: string
		isSaveLoading: boolean

		name: string
		id: number
		webApiType: string
		author: string
	}

	parameters: {
		method: string
		url: string
		urlError: string
		isTryLoading: boolean

		queryParams: ParamItem[]
		headerParams: ParamItem[]
		bodyType: string
		textBody: string
		bodyError: string
	}

	response: {
		status: string
		headerParams: ParamItem[]
		body: any
		bodyType: string
	}
}

export interface DatasourceState extends DatasourceAttributes {
	block: {
		isWizardMode: boolean
		isModalOpen: boolean
	}

	actions: {
		updateState: (modifier: RecursivePartial<DatasourceState>) => void
		tryRequest: () => void
		fireRequest: () => Promise<[string?, any?]>
		updateRequestBodyType: (bodyType: string) => void

		overrideMethodUrl: (method?: string, url?: string) => void
		overrideQueryParams: (record?: Record<string, string>) => void
		overrideHeaderParams: (record?: Record<string, string>) => void
		overrideBody: (newBody?: string) => void
	}
}

export const datasourceStoreCreator = (initalState: BlockAttributes) => {
	return immer<DatasourceState>((set, get) => ({
		...initalState,

		openAccordionItems: ['request'],
		isContentTypeLock: false,

		heading: {
			pageError: '',
			isSaveLoading: false,

			name: '',
			id: -1,
			webApiType: 'general',
			author: '',
		},

		parameters: {
			method: 'GET',
			url: '',
			urlError: '',
			isTryLoading: false,

			queryParams: [createParamItem()],
			headerParams: [createParamItem()],
			bodyType: 'none',
			textBody: '',
			paramsBody: [createParamItem()],
			bodyError: '',
		},
		response: {
			status: '',
			headerParams: [createParamItem()],
			body: '',
			bodyType: '',
		},

		block: {
			isWizardMode: !initalState.requestParams.url || !initalState.output.contentType,
			isModalOpen: false,
		},

		actions: {
			updateState: (modifier: RecursivePartial<DatasourceAttributes>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),

			tryRequest: async () => {
				set((state) => {
					state.parameters.isTryLoading = true
					state.heading.pageError = ''
				})

				const { requestParams, parameters } = get()

				const url = parameters.url ? parameters.url : requestParams.url
				const method = parameters.method ? parameters.method : requestParams.method
				const headerParams = parameters.headerParams.length > 0 ? parameters.headerParams : requestParams.headerParams
				const queryParams = parameters.queryParams.length > 0 ? parameters.queryParams : requestParams.queryParams

				const bodyType = parameters.bodyType ? parameters.bodyType : requestParams.bodyType
				const paramsBody = requestParams.paramsBody
				const textBody = parameters.bodyType && parameters.textBody ? parameters.textBody : requestParams.textBody

				let body: any = null
				if (bodyType === 'form-urlencoded') {
					body = new URLSearchParams(mapParamsToObject(paramsBody))
				}
				if (bodyType === 'form-data') {
					const bodyFormData = new FormData()
					const paramsObject = mapParamsToObject(paramsBody)
					Object.keys(paramsObject).forEach((k) => bodyFormData.append(k, paramsObject[k]))

					body = bodyFormData
				}
				if (isTextType(bodyType)) {
					body = textBody
				}

				const [status, headers, data] = await handleTryRequest(method, url, mapParamsToObject(queryParams), mapParamsToObject(headerParams), body)

				if (!status || status === 'ERR_NETWORK') {
					// eslint-disable-next-line
					const pageErrorText = __(
						'The request failed (maybe the request was blocked by CORS). Open the browser dev tools for more information.',
						'inseri-core'
					)
					set((state) => {
						state.heading.pageError = pageErrorText
					})
				} else {
					const responseContentType: string = getPropertyCaseInsensitive(headers, CONTENT_TYPE) ?? ''
					const incomingBodyType = getBodyTypeByContenType(responseContentType) ?? 'raw'
					let preparedBody: string | { url: string; filename: string } = ''

					if (incomingBodyType === 'image') {
						preparedBody = url
					} else if (incomingBodyType === 'raw') {
						const urlObject = URL.createObjectURL(new Blob([data]))
						const parts = url.split('/')
						const lastPart = parts[parts.length - 1]
						preparedBody = { url: urlObject, filename: lastPart }
					} else {
						const textBlob = new Blob([data])
						preparedBody = await textBlob.text()
					}

					if (isBeautifyType(incomingBodyType) && typeof preparedBody === 'string') {
						const formattedCode = formatCode(incomingBodyType, preparedBody)[1]
						preparedBody = formattedCode ?? preparedBody
					}

					set((state) => {
						if (!state.isContentTypeLock) {
							state.output.contentType = responseContentType
						}

						state.openAccordionItems = Array.from(new Set([...state.openAccordionItems, 'response']))
						state.response = {
							...state.response,
							status,
							bodyType: incomingBodyType,
							body: preparedBody,
							headerParams: mapObjectToParams(headers),
						}
					})
				}

				set((state) => {
					state.parameters.isTryLoading = false
				})
			},

			fireRequest: async () => {
				const { requestParams, parameters, output } = get()

				const url = parameters.url ? parameters.url : requestParams.url
				const method = parameters.method ? parameters.method : requestParams.method
				const headerParams = parameters.headerParams.length > 0 ? parameters.headerParams : requestParams.headerParams
				const queryParams = parameters.queryParams.length > 0 ? parameters.queryParams : requestParams.queryParams

				const bodyType = parameters.bodyType ? parameters.bodyType : requestParams.bodyType
				const paramsBody = requestParams.paramsBody
				const textBody = parameters.bodyType && parameters.textBody ? parameters.textBody : requestParams.textBody

				let body: any = null
				if (bodyType === 'form-urlencoded') {
					body = new URLSearchParams(mapParamsToObject(paramsBody))
				}
				if (bodyType === 'form-data') {
					const bodyFormData = new FormData()
					const paramsObject = mapParamsToObject(paramsBody)
					Object.keys(paramsObject).forEach((k) => bodyFormData.append(k, paramsObject[k]))

					body = bodyFormData
				}
				if (isTextType(bodyType)) {
					body = textBody
				}

				return await fireWebApi(method, url, mapParamsToObject(queryParams), mapParamsToObject(headerParams), body, output.contentType)
			},

			updateRequestBodyType: (bodyType: string) => {
				const { headerParams } = get().requestParams

				const foundIndex = headerParams.findIndex((i) => i.key.toLowerCase() === CONTENT_TYPE.toLowerCase())
				const newContentType = { isChecked: true, key: CONTENT_TYPE, value: BODY_TYPE_TO_CONTENT_TYPE[bodyType] }
				const itemsToInsert = [bodyType === 'none' ? null : newContentType].filter(Boolean) as ParamItem[]

				// if found then replace
				// otherwise insert at 2nd last place (because last item is an empty item)
				const beginIndex = foundIndex >= 0 ? foundIndex + 1 : -1
				const updatedHeaders = [...headerParams.slice(0, foundIndex), ...itemsToInsert, ...headerParams.slice(beginIndex)]

				set((state) => {
					state.requestParams.headerParams = updatedHeaders
					state.requestParams.bodyType = bodyType
				})
			},

			overrideMethodUrl: (method?: string, url?: string) => {
				set((state) => {
					if (method) {
						state.parameters.method = method
					}
					if (url) {
						state.parameters.url = url
					}

					if (!method && !url) {
						state.parameters.method = ''
						state.parameters.url = ''
					}
				})
			},
			overrideQueryParams: (record?: Record<string, string>) => {
				set((state) => {
					if (record) {
						state.parameters.queryParams.push(...mapObjectToParams(record))
					} else {
						state.parameters.queryParams = []
					}
				})
			},
			overrideHeaderParams: (record?: Record<string, string>) => {
				set((state) => {
					if (record) {
						state.parameters.headerParams.push(...mapObjectToParams(record))
					} else {
						state.parameters.headerParams = []
					}
				})
			},
			overrideBody: (newBody?: string) => {
				set((state) => {
					if (newBody) {
						state.parameters.bodyType = 'text'
						state.parameters.textBody = newBody
					} else {
						state.parameters.bodyType = ''
						state.requestParams.textBody = ''
					}
				})
			},
		},
	}))
}
