import { ConsumerBeacon } from '@inseri/lighthouse'
import { IconPhoto } from '@tabler/icons-react'
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
	input: ConsumerBeacon
	caption: string
	altText: string
	height: number | null
	fit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
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
	icon: <IconPhoto style={{ fill: 'none' }} />,
})
