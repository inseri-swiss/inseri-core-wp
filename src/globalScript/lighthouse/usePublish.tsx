import { useContext, useEffect, useMemo } from '@wordpress/element'
import { usePrevious } from 'react-use'
import { BlockIdContext, blockStoreSubject, onNext } from './core'
import { none, some } from './option'

type Publish<T> = (value: T, contentType: string) => void
type SetEmpty = () => void
export type Actions<T> = [Publish<T>, SetEmpty]

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
	keys = blockId ? keys : []
	const prevKeys = usePrevious(keys) ?? []

	useEffect(() => {
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
	}, [keys.join(), descriptions.join(), joinedBlockIds, blockId])

	return useMemo(() => {
		const callbackMap = keys.reduce(
			(acc, key) => {
				const publish = (value: any, contentType: string) => {
					onNext({ type: 'set-value', payload: { blockId, key, content: some({ contentType, value }) } })
				}
				const setEmpty = () => {
					onNext({ type: 'set-value', payload: { blockId, key, content: none } })
				}

				acc[key] = [publish, setEmpty]

				return acc
			},
			{} as Record<string, Actions<any>>
		)

		return callbackMap
	}, [keys.join(), joinedBlockIds, blockId])
}

export { usePublish }
