import { IconCode } from '@tabler/icons'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { SetupEditorEnv } from '../../components'
import { ConsumerBeacon, ProducerBeacon } from '../../globalScript'
import json from './block.json'
import { TextEditorEdit } from './Component'
import './style.scss'

const { name, ...settings } = json as any

export interface Attributes {
	blockId?: string
	input?: ConsumerBeacon
	output?: ProducerBeacon
	blockName: string
	height: number
	editable: boolean
	content: string
	label: string
	mode: 'editor' | 'viewer'
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
		<div {...useBlockProps.save()} data-attributes={stringify(attributes)}>
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
