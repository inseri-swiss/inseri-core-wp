import { useEffect, useRef } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { BlockIdContext, onNext } from './core'

interface RootProps extends PropsWithChildren {
	blockId: string
	blockName: string
	blockType: string
	clientId?: string
}

export function InseriRoot(props: RootProps) {
	const { children, blockId, blockName, blockType, clientId = '' } = props
	const componentWillUnmount = useRef(false)

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

	return <BlockIdContext.Provider value={blockId}>{children}</BlockIdContext.Provider>
}
