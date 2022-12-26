import { createContext, useContext, useRef } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { persistToAttributes } from '../utils'
import create, { useStore, StateCreator, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'
import { setAutoFreeze } from 'immer'

const StateContext = createContext<StoreApi<any> | undefined>(undefined)

interface SimpleProps<T> extends PropsWithChildren<any> {
	stateCreator: (initialState: T) => StateCreator<T, [], []>
	initialState: T
}
interface AttributesProps<T> extends PropsWithChildren<any> {
	stateCreator: (initialState: T) => StateCreator<T, any, any>
	setAttributes: (attrs: Partial<Record<string, any>>) => void
	attributes: Readonly<Record<string, any>>
	keysInSync: string[]
}

type StateProviderProps<T> = SimpleProps<T> | AttributesProps<T>

export function StateProvider<T>({ initialState, children, stateCreator, setAttributes, attributes, keysInSync }: StateProviderProps<T>) {
	const storeRef = useRef<StoreApi<any>>()

	if (!storeRef.current) {
		let store: any

		if (setAttributes && attributes && keysInSync) {
			const initialStateFromAttributes = Object.entries(attributes)
				.filter(([k, _]) => keysInSync.includes(k))
				.reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as T

			store = persistToAttributes(stateCreator(initialStateFromAttributes) as any, { setAttributes, keysToSave: keysInSync })
		} else {
			store = stateCreator(initialState)
		}

		if (process.env.NODE_ENV !== 'production') {
			store = devtools(store, { name: attributes.blockId ?? 'component' })
			setAutoFreeze(true)
		} else {
			setAutoFreeze(false)
		}

		storeRef.current = create(store)
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
