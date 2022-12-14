import { IconApi } from '@tabler/icons'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { SetupEditorEnv } from '../../components'
import { ProducerBeacon } from '../../globalScript'
import json from './block.json'
import { DropdownEdit } from './Component'

const { name, ...settings } = json as any

export interface Attributes {
	blockId?: string
	output?: ProducerBeacon
	blockName: string
	baseWebApi?: number
}

function Edit(props: BlockEditProps<Attributes>) {
	return (
		<SetupEditorEnv {...props} baseBlockName={'webApi'}>
			<DropdownEdit {...props} />
		</SetupEditorEnv>
	)
}

function Save({ attributes }: BlockSaveProps<Attributes>) {
	return (
		<div {...useBlockProps.save()} data-attributes={stringify(attributes)}>
			is loading ...
		</div>
	)
}

registerBlockType<Attributes>(name, {
	...settings,
	edit: Edit,
	save: Save,
	icon: <IconApi style={{ fill: 'none' }} />,
})
