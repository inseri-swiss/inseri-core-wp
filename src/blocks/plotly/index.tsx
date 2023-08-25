import { IconChartBar } from '@tabler/icons-react'
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
	inputFull: string
	inputData: string
	inputLayout: string
	inputConfig: string
	height: number
	outputs: [string /* key */, string /* desc */][]
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
	icon: <IconChartBar style={{ fill: 'none' }} />,
})
