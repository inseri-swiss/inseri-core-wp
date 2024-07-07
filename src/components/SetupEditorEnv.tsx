import { generateId, md5 } from '../utils'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { dispatch, select, use, useSelect } from '@wordpress/data'
import { useEffect, useMemo, useState } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { InseriThemeProvider } from './InseriThemeProvider'

interface Props extends PropsWithChildren<BlockEditProps<any>> {
	baseBlockName: string
	addSuffixToInputs?: string[]
	addSuffixToInputRecord?: string[]
}

const includeChildrendIds = (clientIds: string[], childParentPairs: [string, string][]) => {
	const result: string[] = [...clientIds]

	clientIds.forEach((id) => {
		let children: string[] = childParentPairs.filter(([_c, parent]) => parent === id).map((t) => t[0])

		while (children.length > 0) {
			result.push(...children)
			children = children.flatMap((pid) => childParentPairs.filter(([_c, parent]) => parent === pid).map((t) => t[0]))
		}
	})

	return [...new Set(result)]
}

export function SetupEditorEnv(props: Props) {
	const { setAttributes, attributes, children, baseBlockName, clientId, addSuffixToInputs = [], addSuffixToInputRecord = [] } = props
	const { blockId } = attributes

	const [isCopyingCompleted, setCopyingStatus] = useState(false)

	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateId() })
		}

		if (!attributes.blockName) {
			setAttributes({ blockName: `${baseBlockName}-${generateId(3)}` })
		}
	}, [])

	const blockCount = useSelect((innerSelect: any) => innerSelect('core/block-editor').getGlobalBlockCount(), [])

	const isBlockIdDuplicated = useMemo(() => {
		const wpSelect: any = select('core/block-editor')

		const clientIdsOfSameBlockType: string[] = wpSelect.getClientIdsWithDescendants()
		return clientIdsOfSameBlockType.some((_clientId) => {
			const _blockId = wpSelect.getBlockAttributes(_clientId).blockId
			return clientId !== _clientId && blockId === _blockId
		})
	}, [blockCount])

	const lastInsertedClientIds = useMemo(() => {
		if (isBlockIdDuplicated) {
			// TODO `use` will be deprecated
			const editorStore: any = use(() => {}, {}).stores['core/block-editor'].store.getState()
			const lastInsertedIds: string[] = editorStore?.lastBlockInserted?.clientIds ?? []
			const parentIdByChildrenId: Map<string, string> = editorStore?.blocks?.parents ?? new Map()
			return includeChildrendIds(lastInsertedIds, [...parentIdByChildrenId])
		}
		return []
	}, [isBlockIdDuplicated])

	const wasThisBlockInserted = lastInsertedClientIds.includes(clientId)

	useEffect(() => {
		const wpSelect: any = select('core/block-editor')
		const wpDispatch: any = dispatch('core/block-editor')

		if (wasThisBlockInserted && !isCopyingCompleted) {
			const suffix = md5(lastInsertedClientIds.join('')).substring(0, 3)
			const attributesObj = wpSelect.getBlockAttributes(clientId)
			const selectedBlockIds = lastInsertedClientIds.map((id) => wpSelect.getBlockAttributes(id)?.blockId).filter((s) => !!s)

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

			setCopyingStatus(true)
		}
	}, [isCopyingCompleted, lastInsertedClientIds])

	return (
		<div {...useBlockProps()}>
			{attributes.blockId && (!wasThisBlockInserted || isCopyingCompleted) ? <InseriThemeProvider>{children}</InseriThemeProvider> : null}
		</div>
	)
}
