import isDeepEqualReact from 'fast-deep-equal/react'
import { createContext } from '@wordpress/element'
import { BehaviorSubject, distinctUntilChanged } from 'rxjs'
import { some } from './option'
import type { Action, Root } from './types'
import { reducer } from './reducer'

export const FILTER_PRIVATE = '__'
export const BlockIdContext = createContext('')

export const blockStoreSubject = new BehaviorSubject<Root>({
	__root: {
		blockName: 'core',
		blockType: 'inseri-core/root',
		clientId: '',
		state: 'ready',
		atoms: {
			'detailed-data-flow': { description: 'detailed data-flow', content: some({ contentType: 'application/json', value: [] }) },
			'data-flow': { description: 'data-flow', content: some({ contentType: 'application/json', value: [] }) },
			blocks: { description: 'blocks', content: some({ contentType: 'application/json', value: [] }) },
			'is-hidden': { description: 'are blocks hidden', content: some({ contentType: 'application/json', value: false }) },
		},
	},
})

export function onNext(action: Action) {
	const reducedBase = reducer(blockStoreSubject.getValue(), action)
	blockStoreSubject.next(reducedBase)
}

if (process.env.NODE_ENV !== 'production') {
	// eslint-disable-next-line no-console
	blockStoreSubject.pipe(distinctUntilChanged((prev, current) => isDeepEqualReact(prev, current))).subscribe((root) => console.log('#lighthouse:', root))
}

export const restorableDataRoot: Record<string, Record<string, any>> = {}
export const restorableDispatchRoot: Record<string, Record<string, (data: any) => void>> = {}
