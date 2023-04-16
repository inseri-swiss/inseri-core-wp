import { IconBooks } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { SelectItem, SetupEditorEnv, StateProvider } from '../../components'
import { ProducerBeacon } from '../../globalScript'
import json from './block.json'
import { ZenodoEdit } from './Component'
import { storeCreator } from './state'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	blockName: string
	label: string
	output: ProducerBeacon
	doi: string
	files: SelectItem[]
	selectedFile: string | null
	isVisible: boolean
}

function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'zenodo'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<ZenodoEdit {...props} />
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
	icon: <IconBooks style={{ fill: 'none' }} />,
})
