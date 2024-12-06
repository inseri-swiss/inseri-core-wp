import { useContext, useEffect, useRef, useState } from '@wordpress/element'
import { Observable, combineLatest, distinctUntilChanged, map, pairwise } from 'rxjs'
import { BlockIdContext, FILTER_PRIVATE, blockStoreSubject } from './core'
import { edgesSubject } from './graph'
import { Option, none } from './option'
import type { Nucleus, Root } from './types'

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

function useWatch<A = any, B = any>(key: string, ops?: WatchOps): B | null // eslint-disable-line @typescript-eslint/no-unused-vars
function useWatch<A = any, B = any>(keys: Record<string, string>, ops?: WatchOps): Record<string, B | null> // eslint-disable-line @typescript-eslint/no-unused-vars
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
		const idLongKeyPairs = subscribersBlockId.startsWith(FILTER_PRIVATE)
			? []
			: longKeys
					.filter((k) => !!k && !k.startsWith(FILTER_PRIVATE))
					.map((key) => {
						return [subscribersBlockId + '-' + key, key]
					})
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
			edgesSubject.next(edgesToRemove as any)
		}
	}, [longKeys.join(), names.join()])

	return state
}

export { useWatch }
