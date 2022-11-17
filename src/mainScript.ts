import domReady from '@wordpress/dom-ready'
import { useEffect, useMemo } from '@wordpress/element'
import type { Draft } from 'immer'
import { nanoid } from 'nanoid/non-secure'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { callMediaFile, callWebApi, getAllItems, getAllMedia } from './ApiServer'
declare global {
	interface Window {
		InseriCore: InseriCoreImpl
		wp: { blockEditor: any }
	}

	const InseriCore: InseriCoreImpl
}

interface Field {
	contentType: string
	isContentTypeDynamic?: boolean
	description: string
	status: 'initial' | 'loading' | 'ready' | 'error' | 'unavailable'
	error?: string
	value?: any
}
type FieldWithKey = Omit<Field, 'status' | 'value' | 'error'> & {
	key: string
}

type SourceDTO = FieldWithKey & {
	slice: string
}

interface StoreWrapper {
	blockTypeByHandle: Record<string, string>
	nameByHandle: Record<string, string>
	//             slice          key
	mainStore: Record<string, Record<string, Field>>
	totalFields: number
}

class InseriCoreImpl {
	#useInternalStore
	readonly #media = 'media'
	readonly #webapi = 'webapi'

	constructor() {
		let store: any = (_set: any) => ({
			blockTypeByHandle: {},
			nameByHandle: {
				[this.#media]: this.#media,
				[this.#webapi]: this.#webapi,
			},
			mainStore: {
				[this.#media]: {},
				[this.#webapi]: {},
			},
			totalFields: 0,
		})

		if (process.env.NODE_ENV !== 'production') {
			store = devtools(store, { name: 'inseri-store' })
		}

		this.#useInternalStore = create(immer<StoreWrapper>(store))

		if (window.wp.blockEditor) {
			this.#fetchMediaAndWebapiSources()
		}
	}

	#generateToken = () => nanoid()

	#fetchMediaAndWebapiSources() {
		getAllMedia().then(([_, mediaData]) => {
			if (mediaData) {
				const mediaFields: FieldWithKey[] = mediaData.map((m) => ({
					key: String(m.id),
					contentType: m.mime_type,
					description: m.title.rendered,
				}))

				this.#useInternalStore.setState((state) => this.#addFieldsCallback(this.#media, mediaFields, state))
			}
		})

		getAllItems().then(([_, webapiData]) => {
			if (webapiData) {
				const webapiFields: FieldWithKey[] = webapiData.map((m) => ({
					key: String(m.id),
					contentType: m.content_type,
					description: m.description,
				}))

				this.#useInternalStore.setState((state) => this.#addFieldsCallback(this.#webapi, webapiFields, state))
			}
		})
	}

	async #initSource({ slice, key: id, contentType }: SourceDTO) {
		const dispatch = this.createDispatch(slice, id)

		dispatch({ status: 'loading' })
		const [error, data] = slice === this.#media ? await callMediaFile(id, contentType) : await callWebApi(id, contentType)

		if (data) {
			dispatch({ value: data, status: 'ready' })
		}

		if (error) {
			dispatch({ error, status: 'error' })
		}
	}

	useInseriStore(source: SourceDTO): Field {
		const { slice, key, contentType, description } = source
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			const currentState = this.#useInternalStore.getState()
			let initSlice = (_state: Draft<StoreWrapper>) => {}

			if (!currentState.mainStore[slice]) {
				initSlice = (state) => {
					state.mainStore[slice] = {}
				}
			}

			if (!currentState.mainStore[slice]?.[key]) {
				this.#useInternalStore.setState((state) => {
					initSlice(state)
					state.mainStore[slice][key] = { contentType, status: 'initial', description }
				})

				if (slice === this.#webapi || slice === this.#media) {
					this.#initSource(source)
				}
			}
		}, [slice, key])

		return this.#useInternalStore((state) => state.mainStore[slice]?.[key] ?? { contentType: '', status: 'initial', description: '' })
	}

	useAvailableSources(category: 'all' | 'media' | 'webapi' | 'block', contentTypeFilter?: string | ((contentType: string) => boolean)) {
		const totalFields = this.#useInternalStore((state) => state.totalFields)

		const filterByCategory = (handle: string) => {
			switch (category) {
				case 'media':
					return handle === this.#media
				case 'webapi':
					return handle === this.#webapi
				case 'block':
					return handle !== this.#media && handle !== this.#webapi
				default:
					return true
			}
		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useMemo(() => {
			const store = this.#useInternalStore.getState()
			const mainStore = store.mainStore
			return Object.entries(mainStore)
				.filter(([handle, _]) => filterByCategory(handle))
				.flatMap(([handle, slice]) => {
					let sources = Object.entries(slice).filter(([_, field]) => field.status !== 'unavailable')
					if (contentTypeFilter) {
						const filterByContentType = typeof contentTypeFilter === 'string' ? (ct: string) => ct.includes(contentTypeFilter) : contentTypeFilter
						sources = sources.filter(([_, field]) => filterByContentType(field.contentType))
					}

					return sources.map(([key, { status, value, description, ...rest }]) => ({
						...rest,
						key,
						slice: handle,
						description: `${store.nameByHandle[handle]}: ${description}`,
					}))
				})
		}, [totalFields, contentTypeFilter, category])
	}

	createDispatch = (blockHandle: string, fieldKey: string) => (updateField: Partial<Omit<Field, 'isContentTypeDynamic'>>) => {
		this.#useInternalStore.setState((state: any) => {
			if (!state.mainStore[blockHandle]) {
				state.mainStore[blockHandle] = {}
			}

			if (!state.mainStore[blockHandle][fieldKey]) {
				state.mainStore[blockHandle][fieldKey] = { status: 'initial', contentType: '', description: '' }
			}

			Object.entries(updateField)
				.filter(([_, itemVal]) => !!itemVal)
				.forEach(([itemKey, itemVal]) => {
					state.mainStore[blockHandle][fieldKey][itemKey] = itemVal
				})
		})
	}

	#addFieldsCallback = (blockHandle: string, fields: FieldWithKey[], state: Draft<StoreWrapper>) => {
		if (!state.mainStore[blockHandle]) {
			state.mainStore[blockHandle] = {}
		}

		fields.forEach((field) => {
			const { key, ...rest } = field
			state.mainStore[blockHandle][key] = { ...rest, status: 'initial' }
		})
		state.totalFields += fields.length
	}

	#removeFieldsCallback = (blockHandle: string, fields: string[], state: Draft<StoreWrapper>) => {
		fields.forEach((k) => {
			state.mainStore[blockHandle][k].status = 'unavailable'
		})
		state.totalFields -= fields.length
	}

	addBlock(blockName: string, fields: FieldWithKey[]): string {
		const blockHandle = this.#generateToken()
		this.#useInternalStore.setState((state) => {
			const l = Object.values(state.blockTypeByHandle).filter((i) => i === blockName).length
			state.blockTypeByHandle[blockHandle] = blockName
			state.nameByHandle[blockHandle] = `${blockName}-${l + 1}`
			this.#addFieldsCallback(blockHandle, fields, state)
		})

		return blockHandle
	}

	changeName(blockHandle: string, name: string) {
		this.#useInternalStore.setState((state) => {
			state.nameByHandle[blockHandle] = name
		})
	}

	removeBlock(blockHandle: string) {
		this.#useInternalStore.setState((state) => {
			const slice = state.mainStore[blockHandle]
			const fields = Object.keys(slice)
			this.#removeFieldsCallback(blockHandle, fields, state)
		})
	}

	addField(blockHandle: string, field: FieldWithKey) {
		this.#useInternalStore.setState((state) => this.#addFieldsCallback(blockHandle, [field], state))
	}

	removeField(blockHandle: string, key: string) {
		this.#useInternalStore.setState((state) => this.#removeFieldsCallback(blockHandle, [key], state))
	}
}

domReady(() => {
	window.InseriCore = new InseriCoreImpl()
})
