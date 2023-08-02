import { useEffect, useMemo, useState } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { initJsonValidator } from './utils'
import { Schema } from 'ajv'
import deepMerge from 'lodash.merge'
import { useDeepCompareEffect, useEffectOnce } from 'react-use'
import { BehaviorSubject, map, pairwise } from 'rxjs'

interface ValueWrapper<T = any> {
	readonly type: 'wrapper'

	readonly contentType: string
	readonly value: T
}

interface None {
	readonly type: 'none'
}

type ValueInfo<T = any> = ValueWrapper<T> | None
type ValueInfoExtra<T = any> = ValueInfo<T> & {
	description: string
}

interface BlockInfo {
	blockType: string
	blockName: string
	state: 'ready' | 'pending' | 'failed'
	values: Record<string, ValueInfoExtra>
}

type Root = Record<string, BlockInfo>

const blockStoreSubject = new BehaviorSubject<Root>({})

// TODO replace with Action Reducer
function onNext(partial: RecursivePartial<Root>) {
	const base = blockStoreSubject.getValue()
	const merged = deepMerge(base, partial)
	blockStoreSubject.next(merged)
}

if (process.env.NODE_ENV !== 'production') {
	// eslint-disable-next-line no-console
	blockStoreSubject.subscribe((root) => console.log('#lighthouse:', root))
}

interface RootProps extends PropsWithChildren {
	blockId: string
	blockName: string
	blockType: string
}

function InseriRoot(props: RootProps) {
	const { children, blockId, blockName, blockType } = props
	let [blockSlice, setBlockSlice] = useState<BlockInfo>()

	useEffect(() => {
		const subscription = blockStoreSubject.pipe(map((store) => store[blockId])).subscribe((slice) => setBlockSlice(slice))
		return () => subscription.unsubscribe()
	}, [blockId])

	useEffect(() => {
		if (blockId?.trim() && !blockSlice) {
			blockSlice = { blockName, blockType, state: 'ready', values: {} }
		} else if (blockSlice) {
			blockSlice.blockName = blockName
		}

		onNext({ [blockId]: blockSlice })
	}, [blockId, blockName])

	return blockSlice ? <>{children}</> : <></>
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

type RawValueItem = Omit<BlockInfo, 'values'> & ValueInfoExtra & { key: string; blockId: string; valueId: string }

interface ValueItem {
	key: string
	description: string
}

function flattenToRawItem(root: Root): RawValueItem[] {
	return Object.entries(root).flatMap(([blockId, block]) =>
		Object.entries(block.values)
			.filter(([_, val]) => !!val)
			.map(([valueId, val]) => {
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
		const firstAction = Object.values(result)[0]
		return firstAction ? firstAction : [(_val: any, _ct: any) => {}, () => {}]
	}

	return result
}

function useInternalPublish(blockId: string, keys: string[], descriptions: string[]): Record<string, Actions<any>> {
	const blockStore = blockStoreSubject.getValue()
	const joinedBlockIds = Object.keys(blockStore).join()

	useEffect(() => {
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

			onNext({ [blockId]: { values } })
		}
	}, [keys.join(), descriptions.join(), joinedBlockIds])

	useEffectOnce(() => {
		return () => {
			const values = { ...blockStore[blockId].values }

			keys.forEach((key) => {
				values[key] = null as any
			})

			onNext({ [blockId]: { values } })
		}
	})

	return useMemo(() => {
		if (blockId?.trim() && blockStore[blockId]) {
			const callbackMap = keys.reduce((acc, key) => {
				const publish = (value: any, contentType: string) => {
					onNext({ [blockId]: { values: { [key]: { type: 'wrapper', value, contentType } } } })
				}

				const setEmpty = () => {
					onNext({ [blockId]: { values: { [key]: { type: 'none', value: null, contentType: null } as any } } })
				}

				acc[key] = [publish, setEmpty]

				return acc
			}, {} as Record<string, Actions<any>>)

			return callbackMap
		}

		return {}
	}, [keys.join(), joinedBlockIds])
}

function useWatch<T = any>(key: string, onBlockRemoved?: (key: string) => void): ValueInfo<T>
function useWatch<T = any>(keys: string, onBlockRemoved?: (key: string) => void): Record<string, ValueInfo<T>>
function useWatch<T = any>(keys: string | string[], onBlockRemoved?: (key: string) => void): any {
	const [state, setState] = useState<Record<string, ValueInfo>>({})
	const longKeys = typeof keys === 'string' ? [keys] : keys

	useEffect(() => {
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
							let simpleValueInfo: ValueInfo

							if (!valueInfo) {
								simpleValueInfo = { type: 'none' }
							} else {
								const { description, ...restInfo } = valueInfo
								simpleValueInfo = { ...restInfo }
							}

							return { ...acc, [fullKey]: simpleValueInfo }
						}, {} as Record<string, ValueInfo<T>>)
				)
			)
			.subscribe(setState)

		return () => {
			onBlockRemovedSubs.forEach((s) => s.unsubscribe())
			valueSubscription.unsubscribe()
		}
	}, [longKeys.join()])

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
