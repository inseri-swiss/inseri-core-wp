import domReady from '@wordpress/dom-ready'
import { useMemo } from '@wordpress/element'
import { Draft } from 'immer'
import { nanoid } from 'nanoid/non-secure'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { getAllMedia } from './ApiServer'
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
	value?: any
}
type FieldWithKey = Omit<Field, 'status' | 'value'> & {
	key: string
}

type SourceDTO = FieldWithKey & {
	slice: string
}

interface StoreWrapper {
	blockTypeByHandle: Record<string, string>
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
			this.#fetchMediaAndFileSources()
		}
	}

	#generateToken = () => nanoid()

	async #fetchMediaAndFileSources() {
		const [_, mediaData] = await getAllMedia()

		if (mediaData) {
			const mediaFields: FieldWithKey[] = mediaData.map((m) => ({
				key: String(m.id),
				contentType: m.mime_type,
				description: m.title.rendered,
			}))

			this.#useInternalStore.setState((state) => this.#addFieldsCallback(this.#media, mediaFields, state))
		}
	}

	useInseriStore({ slice, key }: SourceDTO): Field {
		return this.#useInternalStore((state) => {
			if (state.mainStore[slice]) {
				return state.mainStore[slice][key]
			}
			return { contentType: '', status: 'initial', description: '' }
		})
	}

	useAvailableSources(category: 'all' | 'media' | 'webApi' | 'block', contentTypeFilter?: string | ((contentType: string) => boolean)) {
		const totalFields = this.#useInternalStore((state) => state.totalFields)

		const filterByCategory = (handle: string) => {
			switch (category) {
				case 'media':
					return handle === this.#media
				case 'webApi':
					return handle === this.#webapi
				case 'block':
					return handle !== this.#media && handle !== this.#webapi
				default:
					return true
			}
		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useMemo(() => {
			const mainStore = this.#useInternalStore.getState().mainStore
			return Object.entries(mainStore)
				.filter(([handle, _]) => filterByCategory(handle))
				.flatMap(([handle, slice]) => {
					let sources = Object.entries(slice).filter(([_, field]) => field.status !== 'unavailable')
					if (contentTypeFilter) {
						const filterByContentType = typeof contentTypeFilter === 'string' ? (ct: string) => ct.includes(contentTypeFilter) : contentTypeFilter
						sources = sources.filter(([_, field]) => filterByContentType(field.contentType))
					}

					return sources.map(([key, { status, value, ...rest }]) => ({ ...rest, key, slice: handle }))
				})
		}, [totalFields, contentTypeFilter, category])
	}

	createDispatch = (blockHandle: string, fieldKey: string) => (updateField: Partial<Omit<Field, 'isContentTypeDynamic'>>) => {
		this.#useInternalStore.setState((state: any) =>
			Object.entries(updateField)
				.filter(([_, itemVal]) => !!itemVal)
				.forEach(([itemKey, itemVal]) => {
					state.mainStore[blockHandle][fieldKey][itemKey] = itemVal
				})
		)
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
			state.blockTypeByHandle[blockHandle] = blockName
			this.#addFieldsCallback(blockHandle, fields, state)
		})

		return blockHandle
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
