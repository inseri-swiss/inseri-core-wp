import { createContext, useContext, useEffect, useMemo, useRef, useState } from '@wordpress/element'
import { Schema } from 'ajv'
import type { PropsWithChildren } from 'react'
import { useDeepCompareEffect, usePrevious } from 'react-use'
import { BehaviorSubject, map, pairwise } from 'rxjs'
import { reducer } from './reducer'
import type { Action, BlockInfo, Root, ValueInfo, ValueInfoExtra } from './types'
import { initJsonValidator } from './utils'

const blockStoreSubject = new BehaviorSubject<Root>({})

function onNext(action: Action) {
	const reducedBase = reducer(blockStoreSubject.getValue(), action)
	blockStoreSubject.next(reducedBase)
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

const BlockIdContext = createContext('')

function InseriRoot(props: RootProps) {
	const { children, blockId, blockName, blockType } = props
	const [blockSlice, setBlockSlice] = useState<BlockInfo>()

	useEffect(() => {
		const subscription = blockStoreSubject.pipe(map((store) => store[blockId])).subscribe((slice) => setBlockSlice(slice))
		return () => subscription.unsubscribe()
	}, [blockId])

	useEffect(() => {
		onNext({ type: 'update-block-slice', payload: { blockId, blockName, blockType } })
	}, [blockId, blockName])

	return blockSlice ? <BlockIdContext.Provider value={blockId}>{children}</BlockIdContext.Provider> : <></>
}

interface DiscoverContentType {
	contentTypeFilter: string | ((contentType: string) => boolean)
}

interface DiscoverJson {
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
	const blockId = useContext(BlockIdContext)

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
				map((rawItems) => rawItems.filter((i) => i.blockId !== blockId)),
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

function usePublish<T = any>(key: string, description: string): Actions<T>
function usePublish<T = any>(keys: KeyDescPack[]): Record<string, Actions<T>>
function usePublish(keys: string | KeyDescPack[], maybeDescription?: string): any {
	const preparedKeys = typeof keys === 'string' ? [keys] : (keys as KeyDescPack[]).map((i) => i.key)
	const preparedDescs = !!maybeDescription ? [maybeDescription] : typeof keys !== 'string' ? (keys as KeyDescPack[]).map((i) => i.description) : []
	const blockId = useContext(BlockIdContext)

	const result = useInternalPublish(blockId, preparedKeys, preparedDescs)

	if (typeof keys === 'string') {
		const firstAction = Object.values(result)[0]
		return firstAction ? firstAction : [(_val: any, _ct: any) => {}, () => {}]
	}

	return result
}

const getDescArrayByKeys =
	(descMap: Map<string, string>) =>
	(keys: string[]): string[] => {
		return keys.map((k) => descMap.get(k) ?? '')
	}

function useInternalPublish(blockId: string, keys: string[], descriptions: string[]): Record<string, Actions<any>> {
	const blockStore = blockStoreSubject.getValue()
	const joinedBlockIds = Object.keys(blockStore).join()

	const prevKeys = usePrevious(keys) ?? []
	const componentWillUnmount = useRef(false)

	useEffect(() => {
		if (blockId?.trim() && blockStore[blockId]) {
			const descByKey = new Map(keys.map((item, idx) => [item, descriptions[idx]]))
			const existingKeys = new Set(prevKeys)
			const newKeys = new Set(keys)

			const keysToRemove = Array.from(new Set([...existingKeys].filter((x) => !newKeys.has(x))))
			const keysToAdd = Array.from(new Set([...newKeys].filter((x) => !existingKeys.has(x))))
			const keysToUpdate = Array.from(new Set([...newKeys].filter((x) => existingKeys.has(x))))

			const descGetter = getDescArrayByKeys(descByKey)
			onNext({ type: 'add-value-infos', payload: { blockId, keys: keysToAdd, descriptions: descGetter(keysToAdd) } })
			onNext({ type: 'update-value-infos', payload: { blockId, keys: keysToUpdate, descriptions: descGetter(keysToUpdate) } })
			onNext({ type: 'remove-value-infos', payload: { blockId, keys: keysToRemove } })
		}
	}, [keys.join(), descriptions.join(), joinedBlockIds])

	useEffect(() => {
		return () => {
			componentWillUnmount.current = true
		}
	}, [])

	useEffect(() => {
		return () => {
			if (componentWillUnmount.current) {
				onNext({ type: 'remove-value-infos', payload: { blockId, keys } })
			}
		}
	}, [keys.join()])

	return useMemo(() => {
		if (blockId?.trim() && blockStore[blockId]) {
			const callbackMap = keys.reduce((acc, key) => {
				const publish = (value: any, contentType: string) => onNext({ type: 'set-value', payload: { blockId, key, value, contentType } })
				const setEmpty = () => onNext({ type: 'set-empty', payload: { blockId, key } })

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
						if (onBlockRemoved && !!old && !current) {
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

export { InseriRoot, useDiscover, usePublish, useWatch }
