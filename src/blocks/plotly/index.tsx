import { ConsumerBeacon } from '@inseri/lighthouse'
import { IconChartBar } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { SetupEditorEnv, StateProvider } from '../../components'
import json from './block.json'
import { PlotlyEdit } from './Component'
import { storeCreator } from './state'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	blockName: string
	inputFull: ConsumerBeacon
	inputData: ConsumerBeacon
	inputLayout: ConsumerBeacon
	inputConfig: ConsumerBeacon
	height: number
	outputs: ConsumerBeacon[]
}

function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'plotly'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<PlotlyEdit {...props} />
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
	icon: <IconChartBar style={{ fill: 'none' }} />,
})
