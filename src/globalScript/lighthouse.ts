import { useEffect, useMemo } from '@wordpress/element'
import type { Draft } from 'immer'
import { setAutoFreeze } from 'immer'
import { nanoid } from 'nanoid/non-secure'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

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

interface SourceDTO extends FieldWithKey {
	slice: string
	instanceName: string
}

interface Meta {
	blockType: string
	instanceName: string
}

interface StoreWrapper {
	//             slice          key
	mainStore: Record<string, Record<string, Field>>
	metaByHandle: Record<string, Meta>
	totalFields: number
}

const generateToken = () => nanoid()

let store: any = (_set: any) => ({
	mainStore: {},
	metaByHandle: {},
	totalFields: 0,
})

if (process.env.NODE_ENV !== 'production') {
	store = devtools(store, { name: 'inseri-store' })
	setAutoFreeze(true)
} else {
	setAutoFreeze(false)
}

const useInternalStore = create(immer<StoreWrapper>(store))

function useInseriStore(source: SourceDTO): Field {
	const { slice, key, contentType, description } = source
	return useInternalStore((state) => state.mainStore[slice]?.[key] ?? { contentType, status: 'initial', description })
}

function useAvailableSources(contentTypeFilter?: string | ((contentType: string) => boolean)): Record<string, SourceDTO> {
	const totalFields = useInternalStore((state) => state.totalFields)

	return useMemo(() => {
		const { mainStore, metaByHandle } = useInternalStore.getState()
		return Object.entries(mainStore)
			.flatMap(([handle, slice]) => {
				let sources = Object.entries(slice).filter(([_, field]) => field.status !== 'unavailable')
				if (contentTypeFilter) {
					const filterByContentType = typeof contentTypeFilter === 'string' ? (ct: string) => ct.includes(contentTypeFilter) : contentTypeFilter
					sources = sources.filter(([_, field]) => filterByContentType(field.contentType))
				}

				const { instanceName } = metaByHandle[handle]
				return sources.map(([key, { status, value, ...rest }]) => ({ ...rest, key, slice: handle, instanceName }))
			})
			.reduce((accumulator, source) => ({ ...accumulator, [`${source.slice}-${source.key}`]: source }), {})
	}, [totalFields, contentTypeFilter])
}

function createDispatch(blockHandle: string, fieldKey: string) {
	useEffect(() => {
		useInternalStore.setState((state) => {
			if (!state.mainStore[blockHandle]) {
				state.mainStore[blockHandle] = {}
			}
			if (!state.mainStore[blockHandle]?.[fieldKey]) {
				state.mainStore[blockHandle][fieldKey] = { contentType: '', status: 'initial', description: '' }
			}
		})
	}, [blockHandle, fieldKey])

	return (updateField: Partial<Omit<Field, 'isContentTypeDynamic'>>) => {
		useInternalStore.setState((state: any) =>
			Object.entries(updateField)
				.filter(([_, itemVal]) => !!itemVal)
				.forEach(([itemKey, itemVal]) => {
					state.mainStore[blockHandle][fieldKey][itemKey] = itemVal
				})
		)
	}
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

function addBlock(blockName: string, handle: string, fields: FieldWithKey[]): string {
	const blockHandle = handle ? handle : generateToken()
	useInternalStore.setState((state) => {
		state.metaByHandle[blockHandle] = {
			blockType: blockName,
			instanceName: blockName,
		}
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

function setInstanceName(blockHandle: string, instanceName: string) {
	useInternalStore.setState((state) => {
		if (state.metaByHandle[blockHandle]) {
			state.metaByHandle[blockHandle].instanceName = instanceName
		}
	})
}

export default {
	useAvailableSources,
	useInseriStore,
	createDispatch,
	setInstanceName,
	addBlock,
	addField,
	removeBlock,
	removeField,
} as const
