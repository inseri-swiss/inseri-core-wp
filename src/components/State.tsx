import { createContext, useContext, useRef } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { persistToAttributes } from '../utils'
import create, { useStore, StateCreator, StoreApi } from 'zustand'

const StateContext = createContext<StoreApi<any> | undefined>(undefined)

interface StateProviderProps<T> extends PropsWithChildren<any> {
	stateCreator: (initialState?: Partial<T>) => StateCreator<T, [], []>

	setAttributes?: (attrs: Partial<Record<string, any>>) => void
	attributes?: Readonly<Record<string, any>>
	keysInSync?: string[]
}

export function StateProvider<T>({ children, stateCreator, setAttributes, attributes, keysInSync }: StateProviderProps<T>) {
	const storeRef = useRef<StoreApi<any>>()

	if (!storeRef.current) {
		if (setAttributes && attributes && keysInSync) {
			const initialStateFromAttributes = Object.entries(attributes)
				.filter(([k, _]) => keysInSync.includes(k))
				.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})

			storeRef.current = create(persistToAttributes(stateCreator(initialStateFromAttributes) as any, { setAttributes, keysToSave: keysInSync }))
		} else {
			storeRef.current = create(stateCreator())
		}
	}

	return <StateContext.Provider value={storeRef.current}>{children}</StateContext.Provider>
}

export function useGlobalState<S, T>(selector: (state: S) => T, equalityFn?: (left: T, right: T) => boolean): T {
	const store = useContext(StateContext)

	if (!store) {
		throw new Error('Missing StateContext.Provider in the tree')
	}

	return useStore(store, selector, equalityFn)
}
