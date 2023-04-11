import { IconEdit } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { SetupEditorEnv, StateProvider } from '../../components'
import { ProducerBeacon } from '../../globalScript'
import json from './block.json'
import { TextEditorEdit } from './Component'
import { storeCreator } from './state'
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

function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'textEditor'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<TextEditorEdit {...props} />
			</StateProvider>
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
	icon: <IconEdit style={{ fill: 'none' }} />,
})
