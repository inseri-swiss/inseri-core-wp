import { createContext, useContext, useEffect, useMemo, useRef, useState } from '@wordpress/element'
import { Schema } from 'ajv'
import type { PropsWithChildren } from 'react'
import { useDeepCompareEffect, usePrevious } from 'react-use'
import { BehaviorSubject, map, pairwise, distinctUntilChanged, combineLatest, Observable, scan } from 'rxjs'
import { Option, none, some } from './option'
import { reducer } from './reducer'
import type { Action, Atom, BlockInfo, Nucleus, Root } from './types'
import { initJsonValidator } from './utils'

const blockStoreSubject = new BehaviorSubject<Root>({
	root: {
		blockName: 'root',
		blockType: 'inseri-core/root',
		state: 'ready',
		atoms: { 'data-flow': { description: 'data-flow', content: some({ contentType: 'application/json', value: [] }) } },
	},
})

const edgesSubject = new BehaviorSubject<any>({})
const edgesObs = edgesSubject.pipe(
	scan((acc, curr) => {
		const merged = { ...acc, ...curr }
		return Object.fromEntries(Object.entries(merged).filter(([_k, v]) => !!v))
	}),
	map<any, any>((record) => Object.values(record).map((edge) => ({ data: edge })))
)
const blockNodesObs = blockStoreSubject.pipe(
	map((root) => {
		return Object.entries(root).map(([blockId, block]) => ({ data: { id: blockId, label: block.blockName } }))
	})
)
const valNodesObs = blockStoreSubject.pipe(
	map(flattenToRawItem),
	map((rawItems) => {
		return rawItems.map((i) => ({ data: { id: i.key, label: i.atomDesc, parent: i.blockId } }))
	})
)

combineLatest([blockNodesObs, valNodesObs, edgesObs], (...collected) => collected.flat())
	.pipe(
		distinctUntilChanged((prev, current) => {
			return (
				prev.length === current.length &&
				prev
					.map((item, idx) => {
						const currentItem = current[idx]
						return item.data.id === currentItem.data.id && item.data.label === currentItem.data.label
					})
					.reduce((a, b) => a && b, true)
			)
		})
	)
	.forEach((nodes) => {
		onNext({ type: 'set-value', payload: { blockId: 'root', key: 'data-flow', content: some({ contentType: 'application/json', value: nodes }) } })
	})

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

type RawValueItem = Omit<BlockInfo, 'atoms'> & Atom & { key: string; blockId: string; atomKey: string; atomDesc: string }

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
				return {
					key: blockId + '/' + atomKey,
					atomKey,
					blockId,
					...restBlock,
					...atom,
					description: block.blockName + ' - ' + atom.description,
					atomDesc: atom.description,
				}
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

type NoneCb<B> = (key: string) => B
type SomeCb<A, B> = (nucleus: Nucleus<A>, key: string) => B

interface WatchOps<A = any, B = any> {
	onBlockRemoved?: (name: string) => void
	deps?: any[]
	onNone?: NoneCb<B>
	onSome?: SomeCb<A, B>
}

const splitTheKey = (keysByName: Record<string, string>) => Object.entries(keysByName).map(([name, key]) => [name, ...key.split('/')])
const transformToOptionTuple = <A,>(
	root: Root,
	[name,blockId,atomKey,]: [string,string,string] // prettier-ignore
) => [name, root[blockId]?.atoms[atomKey]?.content ?? none] as [string, Option<Nucleus<A>>]

const foldValues =
	<A, B>(noneRef: React.MutableRefObject<NoneCb<B> | (() => null)>, someRef: React.MutableRefObject<SomeCb<A, B>>) =>
	(
		[name,maybeNucleus,]: [string,Option<Nucleus<A>>] // prettier-ignore
	) =>
		[
			name,
			maybeNucleus.fold(
				() => noneRef.current(name),
				(a: any) => someRef.current(a, name)
			),
		] as [string, B | null]

const reduceIfNeeded =
	<B,>(isRecord: boolean) =>
	(listOfValues: [string, B | null][]) =>
		isRecord ? listOfValues.reduce((accumulator, [name, val]) => ({ ...accumulator, [name]: val }), {} as Record<string, any>) : listOfValues[0][1]

const initState =
	<A, B>(
		keysByName: Record<string, string>,
		noneRef: React.MutableRefObject<NoneCb<B> | (() => null)>,
		someRef: React.MutableRefObject<SomeCb<A, B>>,
		isRecord: boolean
	) =>
	() => {
		const listOfValues = splitTheKey(keysByName)
			.map((triple) => transformToOptionTuple<A>(blockStoreSubject.getValue(), triple as [string, string, string]))
			.map(foldValues<A, B>(noneRef, someRef))

		return reduceIfNeeded<B>(isRecord)(listOfValues)
	}

const NullFn = () => null
const IdentityFn = (a: Nucleus<any>) => a.value

function useWatch<A = any, B = any>(key: string, ops?: WatchOps): B | null
function useWatch<A = any, B = any>(keys: Record<string, string>, ops?: WatchOps): Record<string, B | null>
function useWatch<A = any, B = any>(keys: string | Record<string, string>, ops?: WatchOps<A, B>): any {
	const onBlockRemoved = ops?.onBlockRemoved
	const isRecord = typeof keys !== 'string'
	const subscribersBlockId = useContext(BlockIdContext)

	const longKeys = isRecord ? Object.values(keys) : [keys]
	const names = isRecord ? Object.keys(keys) : ['']
	const keysByName = isRecord ? keys : { '': keys }

	const someRef = useRef(ops?.onSome ?? IdentityFn)
	const noneRef = useRef(ops?.onNone ?? NullFn)

	const [state, setState] = useState<Record<string, B | null> | B | null>(initState(keysByName, noneRef, someRef, isRecord))
	const deps = ops?.deps ?? []

	useEffect(() => {
		someRef.current = ops?.onSome ?? IdentityFn
		noneRef.current = ops?.onNone ?? NullFn
	}, [...deps])

	useEffect(() => {
		const idLongKeyPairs = longKeys.map((key) => [subscribersBlockId + '-' + key, key])
		const edges = Object.fromEntries(idLongKeyPairs.map(([id, key]) => [id, { source: key, target: subscribersBlockId, id }]))
		edgesSubject.next(edges)

		const onBlockRemovedSubs = splitTheKey(keysByName).map(([name, blockId, atomKey]) =>
			blockStoreSubject
				.pipe(
					map((root) => root[blockId]?.atoms?.[atomKey]),
					pairwise()
				)
				.subscribe(([old, current]) => {
					if (onBlockRemoved && !!old && !current) {
						onBlockRemoved(name)
					}
				})
		)

		const valueObs: Observable<[string, B | null]>[] = splitTheKey(keysByName).map((triple) =>
			blockStoreSubject.pipe(
				map((root) => transformToOptionTuple<A>(root, triple as [string, string, string])),
				distinctUntilChanged(([_, a], [__, b]) => a.equals(b, (i1, i2) => i1.contentType === i2.contentType && i1.value === i2.value)),
				map(foldValues<A, B>(noneRef, someRef))
			)
		)

		const valueSubscription = combineLatest(valueObs)
			.pipe(map(reduceIfNeeded<B>(isRecord)))
			.subscribe(setState)

		return () => {
			onBlockRemovedSubs.forEach((s) => s.unsubscribe())
			valueSubscription.unsubscribe()

			const edgesToRemove = Object.fromEntries(idLongKeyPairs.map(([id, _key]) => [id, null]))
			edgesSubject.next(edgesToRemove)
		}
	}, [longKeys.join(), names.join()])

	return state
}

export { Actions, InseriRoot, Nucleus, useDiscover, usePublish, useWatch }
