import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { useEffect } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { generateId, md5 } from '@inseri/utils'
import { InseriThemeProvider } from './InseriThemeProvider'
import { select, useSelect, dispatch } from '@wordpress/data'

export function SetupEditorEnv(props: PropsWithChildren<BlockEditProps<any>> & { baseBlockName: string }) {
	const { setAttributes, attributes, children, baseBlockName, isSelected, clientId } = props
	const { blockId } = attributes

	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateId() })
		}

		if (!attributes.blockName) {
			setAttributes({ blockName: `${baseBlockName}-${generateId(3)}` })
		}
	}, [])

	const blockCount = useSelect((innerSelect: any) => innerSelect('core/block-editor').getGlobalBlockCount(), [])

	useEffect(() => {
		const wpSelect: any = select('core/block-editor')
		const wpDispatch: any = dispatch('core/block-editor')

		const selectedClientIds: string[] = wpSelect.getMultiSelectedBlockClientIds()
		const clientIdsOfSameBlockType: string[] = wpSelect.getClientIdsWithDescendants()
		const hasDuplicatedBlockId = clientIdsOfSameBlockType.some((_clientId) => {
			const _blockId = wpSelect.getBlockAttributes(_clientId).blockId
			return clientId !== _clientId && blockId === _blockId
		})

		if (hasDuplicatedBlockId && isSelected) {
			const suffix = generateId(3)
			wpDispatch.updateBlockAttributes(clientId, { blockId: blockId + suffix })
		}

		if (hasDuplicatedBlockId && selectedClientIds.includes(clientId)) {
			const suffix = md5(selectedClientIds.join('')).substring(0, 3)
			wpDispatch.updateBlockAttributes(clientId, { blockId: blockId + suffix })
		}
	}, [blockCount])

	return <div {...useBlockProps()}>{attributes.blockId ? <InseriThemeProvider>{children}</InseriThemeProvider> : null}</div>
}
