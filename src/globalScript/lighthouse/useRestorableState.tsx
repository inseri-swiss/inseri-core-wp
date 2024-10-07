import { useContext, useState } from '@wordpress/element'
import { BlockIdContext, restorableDataRoot, restorableDispatchRoot } from './core'
import type { Dispatch, SetStateAction } from 'react'

export function useRestorableState<T>(key: string, initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
	const [state, setState] = useState<T>(initialState)
	const blockId = useContext(BlockIdContext)

	if (!restorableDataRoot[blockId]) {
		restorableDataRoot[blockId] = {}
		restorableDispatchRoot[blockId] = { [key]: setState }
	}

	restorableDataRoot[blockId][key] = state

	return [state, setState]
}
