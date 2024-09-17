import { useEffect, useRef, useState } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { map } from 'rxjs'
import { BlockIdContext, blockStoreSubject, onNext } from './core'
import type { BlockInfo } from './types'

interface RootProps extends PropsWithChildren {
	blockId: string
	blockName: string
	blockType: string
	clientId?: string
}

export function InseriRoot(props: RootProps) {
	const { children, blockId, blockName, blockType, clientId = '' } = props
	const [blockSlice, setBlockSlice] = useState<BlockInfo>()
	const componentWillUnmount = useRef(false)

	useEffect(() => {
		const subscription = blockStoreSubject.pipe(map((store) => store[blockId])).subscribe((slice) => setBlockSlice(slice))
		return () => subscription.unsubscribe()
	}, [blockId])

	useEffect(() => {
		onNext({ type: 'update-block-slice', payload: { blockId, blockName, blockType, clientId } })
	}, [blockId, blockName, clientId])

	useEffect(() => {
		return () => {
			componentWillUnmount.current = true
		}
	}, [])

	useEffect(() => {
		return () => {
			if (componentWillUnmount.current) {
				onNext({ type: 'remove-all-value-infos', payload: { blockId } })
			}
		}
	}, [blockId])

	return blockSlice ? <BlockIdContext.Provider value={blockId}>{children}</BlockIdContext.Provider> : <></>
}
