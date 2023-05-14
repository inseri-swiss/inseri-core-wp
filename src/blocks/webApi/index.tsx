import { IconApi } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { ParamItem } from '../../components/ParamsTable'
import { ConsumerBeacon, ProducerBeacon } from '../../globalScript'
import json from './block.json'
import Edit from './edit'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	output: ProducerBeacon
	inputMethodUrl: ConsumerBeacon
	inputQueryParams: ConsumerBeacon
	inputHeadersParams: ConsumerBeacon
	inputBody: ConsumerBeacon
	blockName: string
	label: string
	isVisible: boolean
	autoTrigger: boolean
	isContentTypeLock: boolean
	pid: {
		type: string
		identifier: string
	}
	requestParams: {
		method: string
		url: string

		queryParams: ParamItem[]
		headerParams: ParamItem[]
		bodyType: string
		textBody: string
		paramsBody: ParamItem[]
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
	icon: <IconApi style={{ fill: 'none' }} />,
})
