import { IconFiles } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import json from './block.json'
import Edit from './edit'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	blockName: string
	label: string
	fileIds: number[]
	selectedFileId: string | null
	isVisible: boolean
}

registerBlockType<Attributes>(name, {
	...settings,
	edit: Edit,
	save: ({ attributes }: BlockSaveProps<Attributes>) => {
		return (
			<div {...useBlockProps.save()} data-attributes={stringify(attributes)}>
				is loading ...
			</div>
		)
	},
	icon: <IconFiles style={{ fill: 'none' }} />,
})
