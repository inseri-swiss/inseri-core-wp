import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps, BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import { SetupEditorEnv } from '../../components'
import { ConsumerBeacon, ProducerBeacon } from '../../globalScript'
import json from './block.json'
import { DropdownEdit } from './Component'
import { IconCaretDown } from '@tabler/icons'

const { name, ...settings } = json as any

export interface Attributes {
	blockId?: string
	input?: ConsumerBeacon
	output?: ProducerBeacon
	blockName?: string
	label: string
}

function Edit(props: BlockEditProps<Attributes>) {
	return (
		<SetupEditorEnv {...props}>
			<DropdownEdit {...props} />
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
	icon: IconCaretDown,
})
