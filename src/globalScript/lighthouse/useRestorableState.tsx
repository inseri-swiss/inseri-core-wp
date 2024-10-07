import { useContext, useState } from '@wordpress/element'
import { BlockIdContext, restorableDataRoot, restorableDispatchRoot } from './core'
import type { Dispatch, SetStateAction } from 'react'

export function useRestorableState<T>(key: string, initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
	const blockId = useContext(BlockIdContext)

	const [state, setState] = useState<T>(() => {
		const maybeData = restorableDataRoot[blockId]?.[key]
		if (maybeData !== undefined) {
			return maybeData
		}

		if (typeof initialState === 'function') {
			return (initialState as Function)()
		}

		return initialState
	})

	if (!restorableDataRoot[blockId]) {
		restorableDataRoot[blockId] = {}
		restorableDispatchRoot[blockId] = {}
	}

	restorableDataRoot[blockId][key] = state
	restorableDispatchRoot[blockId][key] = setState

	return [state, setState]
}
