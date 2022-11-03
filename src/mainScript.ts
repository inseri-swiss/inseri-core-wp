import domReady from '@wordpress/dom-ready'
import { nanoid } from 'nanoid/non-secure'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
declare global {
	interface Window {
		InseriCore: InseriCore
	}
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
}

class InseriCore {
	#useInternalStore

	constructor() {
		let store: any = (_set: any) => ({ blockTypeByHandle: {}, mainStore: {} })

		if (process.env.NODE_ENV !== 'production') {
			store = devtools(store, { name: 'inseri-store' })
		}

		this.#useInternalStore = create(immer<StoreWrapper>(store))
	}

	#generateToken = () => nanoid()

	useInseriStore({ slice, key }: SourceDTO): Field {
		return this.#useInternalStore((state) => {
			if (state.mainStore[slice]) {
				return state.mainStore[slice][key]
			}
			return { contentType: '', status: 'initial', description: '' }
		})
	}

	useAvailableSources(contentTypeFilter?: string | ((contentType: string) => boolean)) {
		const mainStore = this.#useInternalStore((state) => state.mainStore)

		let sources: SourceDTO[] = Object.entries(mainStore).flatMap(([handle, slice]) => {
			let sourcesOfSlice = Object.entries(slice).filter(([_, field]) => field.status !== 'unavailable')
			if (contentTypeFilter) {
				const filterByContentType = typeof contentTypeFilter === 'string' ? (ct: string) => ct.includes(contentTypeFilter) : contentTypeFilter
				sourcesOfSlice = sourcesOfSlice.filter(([_, field]) => filterByContentType(field.contentType))
			}

			return sourcesOfSlice.map(([key, { status, value, ...rest }]) => ({ ...rest, key, slice: handle }))
		})

		return sources
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

	addBlock(blockName: string, fields: FieldWithKey[]): string {
		const blockHandle = this.#generateToken()

		this.#useInternalStore.setState((state) => {
			const slice: Record<string, Field> = {}
			fields.forEach((field) => {
				const { key, ...rest } = field
				slice[key] = { ...rest, status: 'initial' }
			})

			state.blockTypeByHandle[blockHandle] = blockName
			state.mainStore[blockHandle] = slice
		})

		return blockHandle
	}

	removeBlock(blockHandle: string) {
		this.#useInternalStore.setState((state) => {
			const slice = state.mainStore[blockHandle]
			Object.keys(slice).forEach((k) => {
				slice[k].status = 'unavailable'
			})
		})
	}

	addField(blockHandle: string, field: FieldWithKey) {
		this.#useInternalStore.setState((state) => {
			const { key, ...rest } = field
			state.mainStore[blockHandle][key] = { ...rest, status: 'initial' }
		})
	}

	removeField(blockHandle: string, key: string) {
		this.#useInternalStore.setState((state) => {
			state.mainStore[blockHandle][key].status = 'unavailable'
		})
	}
}

domReady(() => {
	window.InseriCore = new InseriCore()
})
