import { IconFileTypography } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { deprecateBlockName } from '../../components/deprecation'
import json from './block.json'
import Edit from './edit'
import './style.scss'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	inputKey: string
	height: number
	content: string
	label: string
	metadata: {
		name: string
	}
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
	icon: <IconFileTypography style={{ fill: 'none' }} />,
	deprecated: [deprecateBlockName(settings)],
})
