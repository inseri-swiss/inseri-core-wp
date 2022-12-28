import { createContext, useContext, useRef } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { persistToAttributes } from '../utils'
import create, { useStore, StateCreator, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware'
import { setAutoFreeze } from 'immer'

const StateContext = createContext<StoreApi<any> | undefined>(undefined)

interface SimpleProps<I, T extends I> extends PropsWithChildren<any> {
	stateCreator: (initialState: I) => StateCreator<T, any, any>
	initialState: I
}
interface AttributesProps<I, T extends I> extends PropsWithChildren<any> {
	stateCreator: (initialState: I) => StateCreator<T, any, any>
	setAttributes: (attrs: Partial<Record<string, any>>) => void
	attributes: Readonly<Record<string, any>>
	keysToSave: string[]
}

type StateProviderProps<I, T extends I> = SimpleProps<I, T> | AttributesProps<I, T>

export function StateProvider<INIT, STATE extends INIT>({
	initialState,
	children,
	stateCreator,
	setAttributes,
	attributes,
	keysToSave,
}: StateProviderProps<INIT, STATE>) {
	const storeRef = useRef<StoreApi<STATE>>()

	if (!storeRef.current) {
		let store: any
		let blockId: string | undefined

		if (setAttributes && attributes && keysToSave) {
			store = persistToAttributes(stateCreator(attributes) as any, { setAttributes, keysToSave })
			blockId = attributes.blockId
		} else {
			store = stateCreator(initialState)
		}

		if (process.env.NODE_ENV !== 'production') {
			store = devtools(store, { name: blockId ?? 'component' })
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
