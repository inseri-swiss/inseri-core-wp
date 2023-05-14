import { IconEdit } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { ProducerBeacon } from '../../globalScript'
import json from './block.json'
import Edit from './edit'
import './style.scss'

const { name, ...settings } = json as any

export interface Attributes {
	blockId?: string
	output: ProducerBeacon
	blockName: string
	height: number
	editable: boolean
	content: string
	label: string
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
	icon: <IconEdit style={{ fill: 'none' }} />,
})
