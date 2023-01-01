import { IconApi } from '@tabler/icons'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { datasourceStoreCreator, datasourceInitialState, SetupEditorEnv, StateProvider } from '../../components'
import { ConsumerBeacon, ProducerBeacon } from '../../globalScript'
import json from './block.json'
import { WebApiEdit } from './Component'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	output: ProducerBeacon
	inputMethodUrl: ConsumerBeacon
	inputQueryParams: ConsumerBeacon
	inputHeadersParams: ConsumerBeacon
	inputBody: ConsumerBeacon
	blockName: string
	webApiId: number
}

function Edit(props: BlockEditProps<Attributes>) {
	return (
		<SetupEditorEnv {...props} baseBlockName={'webApi'}>
			<StateProvider
				stateCreator={datasourceStoreCreator}
				initialState={{ ...datasourceInitialState, ...props.attributes }}
				keysToSave={Object.keys(json.attributes)}
				setAttributes={props.setAttributes}
			>
				<WebApiEdit {...props} />
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
	icon: <IconApi style={{ fill: 'none' }} />,
})
