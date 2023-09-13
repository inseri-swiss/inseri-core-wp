import { generateId, md5 } from '@inseri/utils'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { dispatch, select, use, useSelect } from '@wordpress/data'
import { useEffect } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { InseriThemeProvider } from './InseriThemeProvider'

interface Props extends PropsWithChildren<BlockEditProps<any>> {
	baseBlockName: string
	addSuffixToInputs?: string[]
	addSuffixToInputRecord?: string[]
}

export function SetupEditorEnv(props: Props) {
	const { setAttributes, attributes, children, baseBlockName, clientId, addSuffixToInputs = [], addSuffixToInputRecord = [] } = props
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
		// TODO `use` will be deprecated
		const lastInsertedClientIds: string[] = use(() => {}, {}).stores['core/block-editor'].store.getState()?.lastBlockInserted?.clientIds ?? []

		const clientIdsOfSameBlockType: string[] = wpSelect.getClientIdsWithDescendants()
		const isBlockIdDuplicated = clientIdsOfSameBlockType.some((_clientId) => {
			const _blockId = wpSelect.getBlockAttributes(_clientId).blockId
			return clientId !== _clientId && blockId === _blockId
		})

		if (isBlockIdDuplicated && lastInsertedClientIds.includes(clientId)) {
			const suffix = md5(lastInsertedClientIds.join('')).substring(0, 3)
			const attributesObj = wpSelect.getBlockAttributes(clientId)
			const selectedBlockIds = lastInsertedClientIds.map((id) => wpSelect.getBlockAttributes(id).blockId)

			const inputEntries = addSuffixToInputs
				.map((k) => [k, ...attributesObj[k].split('/')])
				.filter(([_kn, inputBlockId, _fk]) => !!inputBlockId)
				.filter(([_kn, inputBlockId, _fk]) => selectedBlockIds.includes(inputBlockId) || selectedBlockIds.includes(inputBlockId + suffix))
				.map(([keyName, inputBlockId, fieldKey]) => [keyName, inputBlockId + suffix + '/' + fieldKey])

			const inputRecordEntries = addSuffixToInputRecord.map((k) => {
				const entries = Object.entries(attributesObj[k])
					.map(([name, inputKey]: any) => [name, ...inputKey.split('/')])
					.filter(([_kn, inputBlockId, _fk]) => !!inputBlockId)
					.filter(([_kn, inputBlockId, _fk]) => selectedBlockIds.includes(inputBlockId) || selectedBlockIds.includes(inputBlockId + suffix))
					.map(([keyName, inputBlockId, fieldKey]) => [keyName, inputBlockId + suffix + '/' + fieldKey])

				const newlyUpdatedRecord = { ...attributesObj[k], ...Object.fromEntries(entries) }
				return [k, newlyUpdatedRecord]
			})

			const { blockName = '' } = attributesObj

			wpDispatch.updateBlockAttributes(clientId, {
				...Object.fromEntries(inputEntries),
				...Object.fromEntries(inputRecordEntries),
				blockId: blockId + suffix,
				blockName: blockName + ' (copy)',
			})
		}
	}, [blockCount])

	return <div {...useBlockProps()}>{attributes.blockId ? <InseriThemeProvider>{children}</InseriThemeProvider> : null}</div>
}
