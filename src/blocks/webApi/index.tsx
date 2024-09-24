import { IconApi } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { deprecateBlockName } from '../../components/deprecation'
import { ParamItem } from '../../components/ParamsTable'
import json from './block.json'
import Edit from './edit'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	outputContenType: string
	inputMethodUrl: string
	inputQueryParams: string
	inputHeadersParams: string
	inputBody: string
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
	metadata: {
		name: string
	}
}

const deprecateUnescapedCode = {
	attributes: {
		...settings.attributes,
		requestParams: {
			...settings.attributes.requestParams,
			textBody: decodeURIComponent(settings.attributes.requestParams.textBody),
		},
	},
	supports: settings.supports,
	save: ({ attributes }: any) => {
		return (
			<div {...useBlockProps.save()} data-attributes={stringify(attributes)}>
				is loading ...
			</div>
		)
	},
	migrate: (attributes: any) => ({
		...attributes,
		requestParams: {
			...attributes.requestParams,
			textBody: encodeURIComponent(attributes.requestParams.textBody),
		},
	}),
	isEligible: (attributes: any) => {
		const textBody = attributes?.requestParams?.textBody
		return typeof textBody === 'string' && decodeURIComponent(textBody) === textBody
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
	icon: <IconApi style={{ fill: 'none' }} />,
	deprecated: [deprecateUnescapedCode, deprecateBlockName(settings)],
})
