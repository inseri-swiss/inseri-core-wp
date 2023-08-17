import { IconHtml } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import json from './block.json'
import Edit from './edit'
import './style.scss'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	blockName: string
	inputKey: string
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
	icon: <IconHtml style={{ fill: 'none' }} />,
})
