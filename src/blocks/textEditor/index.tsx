import { IconCode } from '@tabler/icons'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import { SetupEditorEnv } from '../../components'
import { ProducerBeacon } from '../../globalScript'
import json from './block.json'
import { TextEditorEdit } from './Component'
import './style.scss'

const { name, ...settings } = json as any

export interface Attributes {
	blockId?: string
	output?: ProducerBeacon
	blockName: string
	height: number
	editable: boolean
}

function Edit(props: BlockEditProps<Attributes>) {
	return (
		<SetupEditorEnv {...props} baseBlockName={'textEditor'}>
			<TextEditorEdit {...props} />
		</SetupEditorEnv>
	)
}

function Save({ attributes }: BlockSaveProps<Attributes>) {
	return (
		<div {...useBlockProps.save()} data-attributes={JSON.stringify(attributes)}>
			is loading ...
		</div>
	)
}

registerBlockType<Attributes>(name, {
	...settings,
	edit: Edit,
	save: Save,
	icon: <IconCode style={{ fill: 'none' }} />,
})
