import { IconBrandJavascript } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import 'allotment/dist/style.css'
import stringify from 'json-stable-stringify'
import { deprecateBlockName, deprecateUnescapedCode } from '../../components/deprecation'
import 'prismjs/themes/prism.css'
import json from './block.json'
import Edit from './edit'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	inputCode: string
	inputs: Record<string, string>
	outputs: [string /* key */, string /* contentType */][]
	height: number
	editable: boolean
	content: string
	label: string
	mode: 'editor' | 'viewer' | ''
	isVisible: boolean
	autoTrigger: boolean
	metadata: {
		name: string
	}
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
	icon: <IconBrandJavascript style={{ fill: 'none' }} />,
	deprecated: [deprecateUnescapedCode(settings), deprecateBlockName(settings)],
})
