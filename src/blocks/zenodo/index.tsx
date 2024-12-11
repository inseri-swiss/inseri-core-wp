import { IconBooks } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { SelectItem } from '@mantine/core'
import json from './block.json'
import Edit from './edit'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	label: string
	doi: string
	files: string[]
	selectedFile: string | null
	isVisible: boolean
	metadata: {
		name: string
	}
}

interface Attributes_V1 {
	blockId: string
	blockName: string
	label: string
	doi: string
	files: SelectItem[]
	selectedFile: string | null
	isVisible: boolean
}

const { metadata, ...attributesV1 } = settings.attributes

const v1 = {
	attributes: {
		...attributesV1,
		blockName: {
			type: 'string',
			default: '',
		},
	},
	supports: settings.supports,
	save: ({ attributes }: BlockSaveProps<Attributes>) => {
		return (
			<div {...useBlockProps.save()} data-attributes={stringify(attributes)}>
				is loading ...
			</div>
		)
	},
	migrate(attributes: Attributes_V1) {
		const { blockName, ...rest } = attributes

		return {
			...rest,
			files: attributes.files.map((f) => f.label),
			selectedFile: attributes.files.find((f) => f.value === attributes.selectedFile)?.label ?? null,
			metadata: {
				name: blockName,
			},
		}
	},
	isEligible(attributes: Attributes_V1) {
		return attributes.files.some((f) => !!f.label && !!f.value)
	},
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
	icon: <IconBooks style={{ fill: 'none' }} />,
	deprecated: [v1],
})
