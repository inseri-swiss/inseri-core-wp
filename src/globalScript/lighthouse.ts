import { useEffect, useMemo } from '@wordpress/element'
import type { Draft } from 'immer'
import { nanoid } from 'nanoid/non-secure'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { callMediaFile, callWebApi, getAllItems, getAllMedia } from '../ApiServer'

declare global {
	interface Window {
		wp: { blockEditor: any }
	}
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
	//             slice          key
	mainStore: Record<string, Record<string, Field>>
	totalFields: number
}

const generateToken = () => nanoid()

const MEDIA = 'media'
const WEBAPI = 'webapi'

let store: any = (_set: any) => ({
	blockTypeByHandle: {},
	mainStore: {
		[MEDIA]: {},
		[WEBAPI]: {},
	},
	totalFields: 0,
})

if (process.env.NODE_ENV !== 'production') {
	store = devtools(store, { name: 'inseri-store' })
}

const useInternalStore = create(immer<StoreWrapper>(store))

if (window.wp.blockEditor) {
	fetchMediaAndWebapiSources()
}

function fetchMediaAndWebapiSources() {
	getAllMedia().then(([_, mediaData]) => {
		if (mediaData) {
			const mediaFields: FieldWithKey[] = mediaData.map((m) => ({
				key: String(m.id),
				contentType: m.mime_type,
				description: m.title.rendered,
			}))

			useInternalStore.setState((state) => addFieldsCallback(MEDIA, mediaFields, state))
		}
	})

	getAllItems().then(([_, webapiData]) => {
		if (webapiData) {
			const webapiFields: FieldWithKey[] = webapiData.map((m) => ({
				key: String(m.id),
				contentType: m.content_type,
				description: m.description,
			}))

			useInternalStore.setState((state) => addFieldsCallback(WEBAPI, webapiFields, state))
		}
	})
}

async function initSource({ slice, key: id, contentType }: SourceDTO) {
	const dispatch = createDispatch(slice, id)

	dispatch({ status: 'loading' })
	const [error, data] = slice === MEDIA ? await callMediaFile(id, contentType) : await callWebApi(id, contentType)

	if (data) {
		dispatch({ value: data, status: 'ready' })
	}

	if (error) {
		dispatch({ error, status: 'error' })
	}
}

function useInseriStore(source: SourceDTO): Field {
	const { slice, key, contentType, description } = source

	useEffect(() => {
		const currentState = useInternalStore.getState()
		let initSlice = (_state: Draft<StoreWrapper>) => {}

		if (!currentState.mainStore[slice]) {
			initSlice = (state) => {
				state.mainStore[slice] = {}
			}
		}

		if (!currentState.mainStore[slice]?.[key]) {
			useInternalStore.setState((state) => {
				initSlice(state)
				state.mainStore[slice][key] = { contentType, status: 'initial', description }
			})

			if (slice === WEBAPI || slice === MEDIA) {
				initSource(source)
			}
		}
	}, [slice, key])

	return useInternalStore((state) => state.mainStore[slice]?.[key] ?? { contentType: '', status: 'initial', description: '' })
}

function useAvailableSources(category: 'all' | 'media' | 'webapi' | 'block', contentTypeFilter?: string | ((contentType: string) => boolean)) {
	const totalFields = useInternalStore((state) => state.totalFields)

	const filterByCategory = (handle: string) => {
		switch (category) {
			case 'media':
				return handle === MEDIA
			case 'webapi':
				return handle === WEBAPI
			case 'block':
				return handle !== MEDIA && handle !== WEBAPI
			default:
				return true
		}
	}

	return useMemo(() => {
		const mainStore = useInternalStore.getState().mainStore
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

const createDispatch = (blockHandle: string, fieldKey: string) => (updateField: Partial<Omit<Field, 'isContentTypeDynamic'>>) => {
	useInternalStore.setState((state: any) =>
		Object.entries(updateField)
			.filter(([_, itemVal]) => !!itemVal)
			.forEach(([itemKey, itemVal]) => {
				state.mainStore[blockHandle][fieldKey][itemKey] = itemVal
			})
	)
}

function addFieldsCallback(blockHandle: string, fields: FieldWithKey[], state: Draft<StoreWrapper>) {
	if (!state.mainStore[blockHandle]) {
		state.mainStore[blockHandle] = {}
	}

	fields.forEach((field) => {
		const { key, ...rest } = field
		state.mainStore[blockHandle][key] = { ...rest, status: 'initial' }
	})
	state.totalFields += fields.length
}

function removeFieldsCallback(blockHandle: string, fields: string[], state: Draft<StoreWrapper>) {
	fields.forEach((k) => {
		state.mainStore[blockHandle][k].status = 'unavailable'
	})
	state.totalFields -= fields.length
}

function addBlock(blockName: string, fields: FieldWithKey[]): string {
	const blockHandle = generateToken()
	useInternalStore.setState((state) => {
		state.blockTypeByHandle[blockHandle] = blockName
		addFieldsCallback(blockHandle, fields, state)
	})

	return blockHandle
}

function removeBlock(blockHandle: string) {
	useInternalStore.setState((state) => {
		const slice = state.mainStore[blockHandle]
		const fields = Object.keys(slice)
		removeFieldsCallback(blockHandle, fields, state)
	})
}

function addField(blockHandle: string, field: FieldWithKey) {
	useInternalStore.setState((state) => addFieldsCallback(blockHandle, [field], state))
}

function removeField(blockHandle: string, key: string) {
	useInternalStore.setState((state) => removeFieldsCallback(blockHandle, [key], state))
}

export default {
	useAvailableSources,
	useInseriStore,
	createDispatch,
	addBlock,
	addField,
	removeBlock,
	removeField,
} as const
