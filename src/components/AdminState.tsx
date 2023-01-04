import { addNewItem, Datasource, DatasourceWithoutId, fireWebApi, getAllItems, getItem, handleTryRequest, updateNewItem } from '../ApiServer'
import { immer } from 'zustand/middleware/immer'
import { ParamItem } from './ParamsTable'
import {} from './DetailViewBody'
import {
	BODY_TYPE_TO_CONTENT_TYPE,
	formatCode,
	getBodyTypeByContenType,
	getPropertyCaseInsensitive,
	isBeautifyType,
	mapObjectToParams,
	mapParamsToObject,
	updatePartially,
	CONTENT_TYPE,
	createParamItem,
	isFormType,
	isTextType,
	PAGES,
} from '../utils'
import { __ } from '@wordpress/i18n'
import { Attributes as BlockAttributes } from '../blocks/webApi'

interface DatasourceAttributes extends BlockAttributes {
	mode: 'create' | 'edit' | 'read' | 'none'
	openAccordionItems: string[]
	item: Datasource | null
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
		paramsBody: ParamItem[]
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
		datasources: Datasource[]
	}

	actions: {
		updateState: (modifier: RecursivePartial<DatasourceState>) => void
		createOrUpdateWebApi: () => void
		tryRequest: () => void
		fireRequest: () => Promise<[string?, any?]>
		loadDatasourceById: () => void
		loadDatasources: () => void
		updateRequestBodyType: (bodyType: string) => void

		overrideMethodUrl: (method?: string, url?: string) => void
		overrideQueryParams: (record?: Record<string, string>) => void
		overrideHeaderParams: (record?: Record<string, string>) => void
		overrideBody: (newBody?: string) => void
	}
}

export const datasourceInitialState: DatasourceAttributes = {
	blockId: '',
	blockName: '',
	output: {
		key: '',
		contentType: '',
	},
	inputMethodUrl: {
		key: '',
		contentType: '',
		description: '',
	},
	inputQueryParams: {
		key: '',
		contentType: '',
		description: '',
	},
	inputHeadersParams: {
		key: '',
		contentType: '',
		description: '',
	},
	inputBody: {
		key: '',
		contentType: '',
		description: '',
	},
	webApiId: -1,
	label: '',
	isVisible: false,

	mode: 'none',
	openAccordionItems: ['request'],
	item: null,
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
}

export const datasourceStoreCreator = (initalState: DatasourceAttributes) => {
	return immer<DatasourceState>((set, get) => ({
		...initalState,
		block: {
			isWizardMode: initalState.webApiId === -1,
			isModalOpen: false,
			datasources: [],
		},

		actions: {
			updateState: (modifier: RecursivePartial<DatasourceAttributes>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),

			loadDatasources: async () => {
				const [_, data] = await getAllItems()
				if (data) {
					set((state) => {
						state.block.datasources = data
					})
				}
			},

			createOrUpdateWebApi: async () => {
				set((state) => {
					state.heading.isSaveLoading = true
				})

				let body: string | undefined
				const { mode, item, parameters, heading, output } = get()
				const { bodyType, headerParams, queryParams, paramsBody, textBody, method, url } = parameters
				const { name, webApiType } = heading

				if (isFormType(bodyType)) {
					body = JSON.stringify(mapParamsToObject(paramsBody))
				} else if (bodyType !== 'none') {
					body = textBody
				}

				const payload: DatasourceWithoutId = {
					method,
					url,
					description: name,
					headers: JSON.stringify(mapParamsToObject(headerParams)),
					query_params: JSON.stringify(mapParamsToObject(queryParams)),
					type: webApiType,
					body,
					content_type: output.contentType,
				}

				let result: [string?, Datasource?]

				if (mode === 'edit' && item) {
					const updatePayload: Datasource = {
						...item,
						...payload,
					}
					result = await updateNewItem(updatePayload)
				} else {
					result = await addNewItem(payload)
				}

				const errorMsg = result[0]
				if (errorMsg) {
					set((state) => {
						state.heading.pageError = errorMsg
						state.heading.isSaveLoading = false
					})
				} else {
					const currentUrl = new URL(window.location.href)
					currentUrl.searchParams.set('page', PAGES.home)
					window.location.href = currentUrl.toString()
				}
			},

			tryRequest: async () => {
				set((state) => {
					state.parameters.isTryLoading = true
					state.heading.pageError = ''
				})

				const { bodyType, headerParams, queryParams, paramsBody, textBody, method, url } = get().parameters

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
				const { contentType } = get().output
				const { bodyType, headerParams, queryParams, paramsBody, textBody, method, url } = get().parameters

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

				return await fireWebApi(method, url, mapParamsToObject(queryParams), mapParamsToObject(headerParams), body, contentType)
			},

			loadDatasourceById: async () => {
				const { webApiId, mode } = get()

				if ((mode === 'edit' || mode === 'read') && webApiId !== -1) {
					const [errorMsg, data] = await getItem(webApiId)

					set((state) => {
						if (errorMsg) {
							state.heading.pageError = errorMsg
						}

						if (data) {
							// eslint-disable-next-line
							const { description, url, method, headers, query_params, type, body, content_type: incomingContentType, id, author_name: authorName } = data

							const queryParamItems = mapObjectToParams(JSON.parse(query_params))
							const headerParamItems: ParamItem[] = mapObjectToParams(JSON.parse(headers))
							const contentTypeItem = headerParamItems.find((i) => i.key.toLowerCase() === CONTENT_TYPE.toLowerCase())
							const bodyType = getBodyTypeByContenType(contentTypeItem?.value) ?? 'none'

							if (mode !== 'read') {
								queryParamItems.push(createParamItem())
								headerParamItems.push(createParamItem())
							}

							if (isFormType(bodyType) && body) {
								state.parameters.paramsBody = mapObjectToParams(JSON.parse(body))

								if (mode !== 'read') {
									state.parameters.paramsBody.push(createParamItem())
								}
							}

							if (!isFormType(bodyType) && body) {
								state.parameters.textBody = body
							}

							state.item = data
							state.isContentTypeLock = true
							state.heading = {
								...state.heading,
								name: description,
								id,
								webApiType: type,
								author: authorName,
							}

							state.parameters = {
								...state.parameters,
								method,
								url,
								queryParams: queryParamItems,
								headerParams: headerParamItems,
								bodyType,
							}

							if (!state.output.contentType) {
								state.output.contentType = incomingContentType
							}
						}
					})
				}
			},

			updateRequestBodyType: (bodyType: string) => {
				const { headerParams } = get().parameters

				const foundIndex = headerParams.findIndex((i) => i.key.toLowerCase() === CONTENT_TYPE.toLowerCase())
				const newContentType = { isChecked: true, key: CONTENT_TYPE, value: BODY_TYPE_TO_CONTENT_TYPE[bodyType] }
				const itemsToInsert = [bodyType === 'none' ? null : newContentType].filter(Boolean) as ParamItem[]

				// if found then replace
				// otherwise insert at 2nd last place (because last item is an empty item)
				const beginIndex = foundIndex >= 0 ? foundIndex + 1 : -1
				const updatedHeaders = [...headerParams.slice(0, foundIndex), ...itemsToInsert, ...headerParams.slice(beginIndex)]

				set((state) => {
					state.parameters.headerParams = updatedHeaders
					state.parameters.bodyType = bodyType
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

					if (!method && !url && state.item) {
						state.parameters.method = state.item.method
						state.parameters.url = state.item.url
					}
				})
			},
			overrideQueryParams: (record?: Record<string, string>) => {
				set((state) => {
					if (record) {
						state.parameters.queryParams.push(...mapObjectToParams(record))
					} else if (state.item) {
						state.parameters.queryParams = mapObjectToParams(JSON.parse(state.item.query_params))
					}
				})
			},
			overrideHeaderParams: (record?: Record<string, string>) => {
				set((state) => {
					if (record) {
						state.parameters.headerParams.push(...mapObjectToParams(record))
					} else if (state.item) {
						state.parameters.headerParams = mapObjectToParams(JSON.parse(state.item.headers))
					}
				})
			},
			overrideBody: (newBody?: string) => {
				set((state) => {
					if (newBody) {
						state.parameters.bodyType = 'text'
						state.parameters.textBody = newBody
					} else if (state.item && state.item.body) {
						const contentTypeValue = getPropertyCaseInsensitive(JSON.parse(state.item.headers), CONTENT_TYPE)
						const bodyType = getBodyTypeByContenType(contentTypeValue) ?? 'none'
						state.parameters.bodyType = bodyType

						if (isFormType(bodyType)) {
							state.parameters.paramsBody = mapObjectToParams(JSON.parse(state.item.body))
						}

						if (!isFormType(bodyType)) {
							state.parameters.textBody = state.item.body
						}
					}
				})
			},
		},
	}))
}
