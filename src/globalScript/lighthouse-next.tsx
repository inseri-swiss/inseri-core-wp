import { useEffect, useMemo, useState } from '@wordpress/element'
import { generateId, initJsonValidator } from './utils'
import type { PropsWithChildren } from 'react'

import { BehaviorSubject, map, pairwise, scan } from 'rxjs'
import deepMerge from 'lodash.merge'
import { Schema } from 'ajv'
import { useDeepCompareEffect } from 'react-use'

interface ValueWrapper<T = any> {
	readonly type: 'wrapper'
	readonly description: string

	readonly contentType: string
	readonly value: T
}

interface None {
	readonly type: 'none'
	readonly description: string
}

type ValueInfo<T = any> = ValueWrapper<T> | None

interface BlockInfo {
	blockType: string
	blockName: string
	state: 'ready' | 'pending' | 'failed'
	values: Record<string, ValueInfo>
}

type Root = Record<string, BlockInfo>

const observableRoot = new BehaviorSubject<RecursivePartial<Root>>({})
const blockStoreSubject = new BehaviorSubject<Root>({})
observableRoot.pipe<Root>(scan((acc, item) => deepMerge(acc, item), {})).subscribe(blockStoreSubject)

interface RootProps extends PropsWithChildren {
	blockId: string
	blockName: string
	blockType: string
	setBlockId?: (blockId: string) => void
}

function InseriRoot(props: RootProps) {
	const { children, blockId, setBlockId, blockName, blockType } = props
	useEffect(() => {
		if (!blockId?.trim() && setBlockId) {
			const newBlockId = generateId(21)
			setBlockId(newBlockId)
		}

		const blockStore = blockStoreSubject.getValue()

		if (!blockId?.trim() && !blockStore[blockId]) {
			blockStore[blockId] = { blockName, blockType, state: 'ready', values: {} }
		} else {
			blockStore[blockId].blockName = blockName
		}

		blockStoreSubject.next(blockStore)
	}, [blockId])

	return children
}

interface DiscoverContentType {
	blockId?: string
	contentTypeFilter: string | ((contentType: string) => boolean)
}

interface DiscoverJson {
	blockId?: string
	jsonSchemas: Schema[]
}

type DiscoverOptions = DiscoverContentType | DiscoverJson

type RawValueItem = Omit<BlockInfo, 'values'> & ValueInfo & { key: string; blockId: string; valueId: string }

interface ValueItem {
	key: string
	description: string
}

function flattenToRawItem(root: Root): RawValueItem[] {
	return Object.entries(root).flatMap(([blockId, block]) =>
		Object.entries(block.values).map(([valueId, val]) => {
			const { values, ...restBlock } = block
			return { key: blockId + '/' + valueId, valueId, blockId, ...restBlock, ...val, description: block.blockName + ' - ' + val.description }
		})
	)
}

function mapToValueItem(rawItems: RawValueItem[]): ValueItem[] {
	return rawItems.map(({ key, description }) => ({ key, description }))
}

const filterByContentType = (contentTypeFilter: string | ((contentType: string) => boolean)) => (rawItems: RawValueItem[]) => {
	let compareContentType: (ct: string) => boolean
	if (typeof contentTypeFilter === 'string') {
		compareContentType = (ct: string) => ct.includes(contentTypeFilter)
	} else {
		compareContentType = contentTypeFilter
	}

	return rawItems.filter((item) => item.type === 'wrapper' && compareContentType(item.contentType))
}

const filterByJsonSchemas = (jsonSchemas: Schema[]) => {
	const jsonValidators = jsonSchemas.map((s) => initJsonValidator(s))

	return (rawItems: RawValueItem[]) => {
		return rawItems.filter((item) => {
			return jsonValidators.some((check) => item.type === 'wrapper' && check(item.value))
		})
	}
}

function useDiscover(ops: DiscoverOptions): ValueItem[] {
	const [state, setState] = useState<ValueItem[]>([])

	useDeepCompareEffect(() => {
		let filter: (d: RawValueItem[]) => RawValueItem[]

		if ('contentTypeFilter' in ops) {
			filter = filterByContentType(ops.contentTypeFilter)
		} else {
			filter = filterByJsonSchemas(ops.jsonSchemas)
		}

		const sub = blockStoreSubject
			.pipe(
				map(flattenToRawItem),
				map((rawItems) => rawItems.filter((i) => i.blockId !== ops.blockId)),
				map(filter),
				map(mapToValueItem)
			)
			.subscribe(setState)

		return () => sub.unsubscribe()
	}, [ops])

	return state
}

type Publish<T> = (value: T, contentType: string) => void
type SetEmpty = () => void
type Actions<T> = [Publish<T>, SetEmpty]

type KeyDescPack = { key: string; description: string }

function usePublish<T = any>(blockId: string, key: string, description: string): Actions<T>
function usePublish<T = any>(blockId: string, keys: KeyDescPack[]): Record<string, Actions<T>>
function usePublish(blockId: string, keys: string | KeyDescPack[], maybeDescription?: string): any {
	const preparedKeys = typeof keys === 'string' ? [keys] : (keys as KeyDescPack[]).map((i) => i.key)
	const preparedDescs = !!maybeDescription ? [maybeDescription] : typeof keys !== 'string' ? (keys as KeyDescPack[]).map((i) => i.description) : []

	const result = useInternalPublish(blockId, preparedKeys, preparedDescs)

	if (typeof keys === 'string') {
		return result[0] ? result[0] : (_val: any, _ct: any) => {}
	}

	return result
}

function useInternalPublish(blockId: string, keys: string[], descriptions: string[]): Record<string, Actions<any>> {
	useEffect(() => {
		const blockStore = blockStoreSubject.getValue()

		if (blockId?.trim() && blockStore[blockId]) {
			const descByKey = new Map(keys.map((item, idx) => [item, descriptions[idx]]))
			const existingKeys = new Set(Object.keys(blockStore[blockId].values))
			const newKeys = new Set(keys)

			const keysToRemove = new Set([...existingKeys].filter((x) => !newKeys.has(x)))
			const keysToAdd = new Set([...newKeys].filter((x) => !existingKeys.has(x)))
			const keysToUpdate = new Set([...newKeys].filter((x) => existingKeys.has(x)))

			const values = { ...blockStore[blockId].values }

			keysToRemove.forEach((key) => {
				values[key] = null as any
			})

			keysToAdd.forEach((key) => {
				values[key] = { description: descByKey.get(key) ?? '', type: 'none' }
			})

			keysToUpdate.forEach((key) => {
				values[key] = { ...values[key], description: descByKey.get(key) ?? '' }
			})

			blockStore[blockId].values = values
			observableRoot.next({ blockId: { values } })
		}
	}, [keys.join(), descriptions.join()])

	return useMemo(() => {
		const blockStore = blockStoreSubject.getValue()

		if (blockId?.trim() && blockStore[blockId]) {
			const callbackMap = keys.reduce((acc, key) => {
				const publish = (value: any, contentType: string) => {
					observableRoot.next({ blockId: { values: { key: { type: 'wrapper', value, contentType } } } })
				}

				const setEmpty = () => {
					observableRoot.next({ blockId: { values: { key: { type: 'none', value: null, contentType: null } as any } } })
				}

				acc[key] = [publish, setEmpty]

				return acc
			}, {} as Record<string, Actions<any>>)

			return callbackMap
		}

		return {}
	}, [keys.join()])
}

type SimpleValueInfo<T = any> = Omit<ValueInfo<T>, 'description'>

function useWatch<T = any>(key: string, onBlockRemoved?: (key: string) => void): SimpleValueInfo<T>
function useWatch<T = any>(keys: string, onBlockRemoved?: (key: string) => void): Record<string, SimpleValueInfo<T>>
function useWatch<T = any>(keys: string | string[], onBlockRemoved?: (key: string) => void): any {
	const [state, setState] = useState<Record<string, SimpleValueInfo>>({})

	useDeepCompareEffect(() => {
		const longKeys = typeof keys === 'string' ? [keys] : keys

		const onBlockRemovedSubs = longKeys
			.map((key) => [key, ...key.split('/')])
			.map(([key, blockId, valueId]) =>
				blockStoreSubject
					.pipe(
						map((root) => root[blockId]?.values?.[valueId]),
						pairwise()
					)
					.subscribe(([old, current]) => {
						if (onBlockRemoved && !!old && current === null) {
							onBlockRemoved(key)
						}
					})
			)

		const valueSubscription = blockStoreSubject
			.pipe(
				map((root) =>
					longKeys
						.map((key) => [key, ...key.split('/')])
						.reduce((acc, [fullKey, blockId, valueId]) => {
							const valueInfo = root[blockId]?.values[valueId]
							let simpleValueInfo: SimpleValueInfo

							if (!valueInfo) {
								simpleValueInfo = { type: 'none' }
							} else {
								const { description, ...restInfo } = valueInfo
								simpleValueInfo = { ...restInfo }
							}

							return { ...acc, [fullKey]: simpleValueInfo }
						}, {} as Record<string, SimpleValueInfo<T>>)
				)
			)
			.subscribe(setState)

		return () => {
			onBlockRemovedSubs.forEach((s) => s.unsubscribe())
			valueSubscription.unsubscribe()
		}
	}, [keys])

	const stateValues = Object.values(state)
	if (typeof keys === 'string' && stateValues.length > 0) {
		return stateValues[0]
	}

	if (typeof keys === 'string') {
		return { type: 'none' }
	}

	return state
}

export { InseriRoot, usePublish, useDiscover, useWatch }
