import { IconBrandPython } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import 'allotment/dist/style.css'
import stringify from 'json-stable-stringify'
import 'prismjs/themes/prism.css'
import { SetupEditorEnv, StateProvider } from '../../components'
import { ConsumerBeacon } from '../../globalScript'
import json from './block.json'
import { PythonEdit } from './Component'
import { storeCreator } from './state'

const { name, ...settings } = json as any

export interface Attributes {
	blockId?: string
	inputCode: ConsumerBeacon
	inputs: Record<string, ConsumerBeacon>
	outputs: ConsumerBeacon[]
	blockName: string
	height: number
	editable: boolean
	content: string
	label: string
	mode: 'editor' | 'viewer' | ''
	isVisible: boolean
	autoTrigger: boolean
}

function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'python'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<PythonEdit {...props} />
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
	icon: <IconBrandPython style={{ fill: 'none' }} />,
})
