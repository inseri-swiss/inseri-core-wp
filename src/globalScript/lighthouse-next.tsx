import { createContext, useContext, useEffect, useMemo, useRef, useState } from '@wordpress/element'
import { Schema } from 'ajv'
import type { PropsWithChildren } from 'react'
import { useDeepCompareEffect, usePrevious } from 'react-use'
import { BehaviorSubject, map, pairwise } from 'rxjs'
import { Option, none, some } from './option'
import { reducer } from './reducer'
import type { Action, Atom, BlockInfo, Nucleus, Root } from './types'
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
	const componentWillUnmount = useRef(false)

	useEffect(() => {
		const subscription = blockStoreSubject.pipe(map((store) => store[blockId])).subscribe((slice) => setBlockSlice(slice))
		return () => subscription.unsubscribe()
	}, [blockId])

	useEffect(() => {
		onNext({ type: 'update-block-slice', payload: { blockId, blockName, blockType } })
	}, [blockId, blockName])

	useEffect(() => {
		return () => {
			componentWillUnmount.current = true
		}
	}, [])

	useEffect(() => {
		return () => {
			if (componentWillUnmount.current) {
				onNext({ type: 'remove-all-value-infos', payload: { blockId } })
			}
		}
	}, [blockId])

	return blockSlice ? <BlockIdContext.Provider value={blockId}>{children}</BlockIdContext.Provider> : <></>
}

interface DiscoverContentType {
	contentTypeFilter: string | ((contentType: string) => boolean)
}

interface DiscoverJson {
	jsonSchemas: Schema[]
}

type DiscoverOptions = DiscoverContentType | DiscoverJson

type RawValueItem = Omit<BlockInfo, 'atoms'> & Atom & { key: string; blockId: string; atomKey: string }

interface DiscoveredItem {
	key: string
	description: string
}

function flattenToRawItem(root: Root): RawValueItem[] {
	return Object.entries(root).flatMap(([blockId, block]) =>
		Object.entries(block.atoms)
			.filter(([_, atom]) => !!atom)
			.map(([atomKey, atom]) => {
				const { atoms, ...restBlock } = block
				return { key: blockId + '/' + atomKey, atomKey, blockId, ...restBlock, ...atom, description: block.blockName + ' - ' + atom.description }
			})
	)
}

function mapToDiscoveredItem(rawItems: RawValueItem[]): DiscoveredItem[] {
	return rawItems.map(({ key, description }) => ({ key, description }))
}

function distinctRawItems(rawItems: RawValueItem[]): RawValueItem[] {
	return rawItems.filter((item, idx, self) => self.findIndex((i) => i.key === item.key) === idx)
}

const filterByContentType = (contentTypeFilter: string | ((contentType: string) => boolean)) => (rawItems: RawValueItem[]) => {
	let compareContentType: (ct: string) => boolean
	if (typeof contentTypeFilter === 'string') {
		compareContentType = (ct: string) => ct.includes(contentTypeFilter)
	} else {
		compareContentType = contentTypeFilter
	}

	return rawItems.filter((item) => item.content.exists((nucleus) => compareContentType(nucleus.contentType)))
}

const filterByJsonSchemas = (jsonSchemas: Schema[]) => {
	const jsonValidators = jsonSchemas.map((s) => initJsonValidator(s))

	return (rawItems: RawValueItem[]) => {
		return rawItems.filter((item) => {
			return jsonValidators.some((check) => item.content.exists((nucleus) => check(nucleus.value)))
		})
	}
}

function useDiscover(ops: DiscoverOptions): DiscoveredItem[] {
	const [state, setState] = useState<DiscoveredItem[]>([])
	const blockId = useContext(BlockIdContext)

	useDeepCompareEffect(() => {
		const filters: Array<(d: RawValueItem[]) => RawValueItem[]> = []

		if ('contentTypeFilter' in ops) {
			filters.push(filterByContentType(ops.contentTypeFilter))
		}
		if ('jsonSchemas' in ops) {
			filters.push(filterByJsonSchemas(ops.jsonSchemas))
		}

		const sub = blockStoreSubject
			.pipe(
				map(flattenToRawItem),
				map((rawItems) => rawItems.filter((i) => i.blockId !== blockId)),
				map((rawItems) => filters.flatMap((filterFn) => filterFn(rawItems))),
				map(distinctRawItems),
				map(mapToDiscoveredItem)
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

	return useMemo(() => {
		if (blockId?.trim() && blockStore[blockId]) {
			const callbackMap = keys.reduce((acc, key) => {
				const publish = (value: any, contentType: string) => {
					onNext({ type: 'set-value', payload: { blockId, key, content: some({ contentType, value }) } })
				}
				const setEmpty = () => {
					onNext({ type: 'set-value', payload: { blockId, key, content: none } })
				}

				acc[key] = [publish, setEmpty]

				return acc
			}, {} as Record<string, Actions<any>>)

			return callbackMap
		}

		return {}
	}, [keys.join(), joinedBlockIds])
}
interface WatchBase {
	onBlockRemoved?: (key: string) => void
}
interface FullWatchOps<A, B> extends WatchBase {
	onNone: (key: string) => B
	onSome: (nucleus: Nucleus<A>, key: string) => B
}

const mapToWatchResult =
	<A, B>(longKeys: string[], areKeysArray: boolean, ops?: WatchBase | FullWatchOps<A, B>) =>
	(root: Root) => {
		let watchedVals: [string, any][] = longKeys
			.map((key) => [key, ...key.split('/')])
			.map(([fullKey, blockId, atomKey]) => [fullKey, root[blockId]?.atoms[atomKey]?.content ?? none])

		if (ops && 'onNone' in ops && 'onSome' in ops) {
			watchedVals = watchedVals.map((pair: [string, Option<Nucleus<A>>]) => [
				pair[0],
				pair[1].fold(
					() => ops.onNone(pair[0]),
					(a) => ops.onSome(a, pair[0])
				),
			])
		}

		if (areKeysArray) {
			return watchedVals.reduce((accumulator, [fullKey, val]) => ({ ...accumulator, [fullKey]: val }), {} as Record<string, any>)
		}

		return watchedVals[0][1]
	}

function useWatch<A = any>(key: string, ops?: WatchBase): Option<Nucleus<A>>
function useWatch<A = any>(keys: string[], ops?: WatchBase): Record<string, Option<Nucleus<A>>>

function useWatch<A = any, B = any>(key: string, ops?: FullWatchOps<A, B>): B
function useWatch<A = any, B = any>(keys: string[], ops?: FullWatchOps<A, B>): Record<string, B>

function useWatch<A = any, B = any>(keys: string | string[], ops?: WatchBase | FullWatchOps<A, B>): any {
	type ResultType = Option<Nucleus<A>> | B

	const onBlockRemoved = ops?.onBlockRemoved
	const areKeysArray = typeof keys !== 'string'

	const longKeys = areKeysArray ? keys : [keys]
	const initRoot = blockStoreSubject.getValue()
	const [state, setState] = useState<Record<string, ResultType> | ResultType>(() => mapToWatchResult(longKeys, areKeysArray, ops)(initRoot))

	useEffect(() => {
		const onBlockRemovedSubs = longKeys
			.map((key) => [key, ...key.split('/')])
			.map(([key, blockId, atomKey]) =>
				blockStoreSubject
					.pipe(
						map((root) => root[blockId]?.atoms?.[atomKey]),
						pairwise()
					)
					.subscribe(([old, current]) => {
						if (onBlockRemoved && !!old && !current) {
							onBlockRemoved(key)
						}
					})
			)

		const valueSubscription = blockStoreSubject.pipe(map(mapToWatchResult(longKeys, areKeysArray, ops))).subscribe(setState)

		return () => {
			onBlockRemovedSubs.forEach((s) => s.unsubscribe())
			valueSubscription.unsubscribe()
		}
	}, [longKeys.join()])

	return state
}

export { Actions, InseriRoot, Nucleus, useDiscover, usePublish, useWatch }
