import domReady from '@wordpress/dom-ready'
import { useMemo } from '@wordpress/element'
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
	totalFields: number
}

class InseriCore {
	#useInternalStore

	constructor() {
		let store: any = (_set: any) => ({ blockTypeByHandle: {}, mainStore: {}, totalFields: 0 })

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
		const totalFields = this.#useInternalStore((state) => state.totalFields)
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useMemo(() => {
			const mainStore = this.#useInternalStore.getState().mainStore
			return Object.entries(mainStore).flatMap(([handle, slice]) => {
				let sourcesOfSlice = Object.entries(slice).filter(([_, field]) => field.status !== 'unavailable')
				if (contentTypeFilter) {
					const filterByContentType = typeof contentTypeFilter === 'string' ? (ct: string) => ct.includes(contentTypeFilter) : contentTypeFilter
					sourcesOfSlice = sourcesOfSlice.filter(([_, field]) => filterByContentType(field.contentType))
				}

				return sourcesOfSlice.map(([key, { status, value, ...rest }]) => ({ ...rest, key, slice: handle }))
			})
		}, [totalFields, contentTypeFilter])
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
			state.totalFields += fields.length
		})

		return blockHandle
	}

	removeBlock(blockHandle: string) {
		this.#useInternalStore.setState((state) => {
			const slice = state.mainStore[blockHandle]
			const fields = Object.keys(slice)

			fields.forEach((k) => {
				slice[k].status = 'unavailable'
			})

			state.totalFields -= fields.length
		})
	}

	addField(blockHandle: string, field: FieldWithKey) {
		this.#useInternalStore.setState((state) => {
			const { key, ...rest } = field
			state.mainStore[blockHandle][key] = { ...rest, status: 'initial' }
			state.totalFields++
		})
	}

	removeField(blockHandle: string, key: string) {
		this.#useInternalStore.setState((state) => {
			state.mainStore[blockHandle][key].status = 'unavailable'
			state.totalFields--
		})
	}
}

domReady(() => {
	window.InseriCore = new InseriCore()
})
