import isDeepEqualReact from 'fast-deep-equal/react'
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, scan } from 'rxjs'
import { FILTER_PRIVATE, blockStoreSubject, onNext } from './core'
import { some } from './option'
import { flattenToRawItem } from './useDiscover'

interface Edge {
	id: string
	source: string
	target: string
}

export const edgesSubject = new BehaviorSubject<Record<string, Edge>>({})
const edgesToValuesObs = edgesSubject.pipe(
	scan((acc, curr) => Object.fromEntries(Object.entries({ ...acc, ...curr }).filter(([_k, v]) => !!v))),
	map((record) => Object.values(record).map((edge) => ({ data: edge })))
)
const edgesToBlockObs = edgesSubject.pipe(
	scan((acc, curr) => Object.fromEntries(Object.entries({ ...acc, ...curr }).filter(([_k, v]) => !!v))),
	map((record) => Object.fromEntries(Object.entries(record).map(([k, v]) => [k, { ...v, source: v.source.split('/')[0] }]))),
	map((record) => Object.values(record).map((edge) => ({ data: edge })))
)
const blockNodesObs = blockStoreSubject.pipe(
	map((root) => {
		return Object.entries(root)
			.filter(([blockId]) => !blockId.startsWith(FILTER_PRIVATE))
			.map(([blockId, block]) => ({ data: { id: blockId, label: block.blockName } }))
	})
)
const valNodesObs = blockStoreSubject.pipe(
	map(flattenToRawItem),
	map((rawItems) => rawItems.filter((i) => !i.blockId.startsWith(FILTER_PRIVATE))),
	map((rawItems) => {
		return rawItems.map((i) => ({ data: { id: i.key, label: i.description, parent: i.blockId } }))
	})
)

combineLatest([blockNodesObs, valNodesObs, edgesToValuesObs], (...collected) => collected.flat())
	.pipe(distinctUntilChanged((prev, current) => isDeepEqualReact(prev, current)))
	.forEach((nodes) => onNextRoot('detailed-data-flow', nodes))

combineLatest([blockNodesObs, edgesToBlockObs], (...collected) => collected.flat())
	.pipe(distinctUntilChanged((prev, current) => isDeepEqualReact(prev, current)))
	.forEach((nodes) => onNextRoot('data-flow', nodes))

blockStoreSubject
	.pipe(
		map((root) =>
			Object.entries(root)
				.filter(([blockId]) => !blockId.startsWith(FILTER_PRIVATE))
				.map(([blockId, { blockName, blockType, clientId }]) => ({ id: blockId, blockName, blockType, clientId }))
		),
		distinctUntilChanged((prev, current) => isDeepEqualReact(prev, current))
	)
	.forEach((vals) => onNextRoot('blocks', vals))

function onNextRoot(key: string, value: any) {
	onNext({ type: 'set-value', payload: { blockId: '__root', key, content: some({ contentType: 'application/json', value }) } })
}
