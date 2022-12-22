import { createContext, useContext, useRef } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { persistToAttributes } from '../utils'
import create, { useStore, StateCreator, StoreApi } from 'zustand'

const StateContext = createContext<StoreApi<any> | undefined>(undefined)

interface StateProviderProps<T> extends PropsWithChildren<any> {
	storeCreator: StateCreator<T, [], []>

	setAttributes?: (attrs: Partial<Record<string, any>>) => void
	attributes?: Readonly<Record<string, any>>
	keysToSave?: string[]
}

export function StateProvider<T>({ children, storeCreator, setAttributes, attributes, keysToSave }: StateProviderProps<T>) {
	const storeRef = useRef<StoreApi<any>>()

	if (!storeRef.current) {
		if (setAttributes && attributes && keysToSave) {
			storeRef.current = create(persistToAttributes(storeCreator as any, { setAttributes, attributes, keysToSave }))
		} else {
			storeRef.current = create(storeCreator)
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
