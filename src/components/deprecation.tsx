import { useBlockProps } from '@wordpress/block-editor'
import stringify from 'json-stable-stringify'

export const deprecateBlockName = (settings: { attributes: any; supports: any }) => {
	const { metadata, ...oldAttributes } = settings.attributes

	return {
		attributes: {
			...oldAttributes,
			blockName: {
				type: 'string',
				default: '',
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
		migrate: (attributes: { blockName: string }) => {
			const { blockName, ...rest } = attributes
			return {
				...rest,
				metadata: {
					name: blockName,
				},
			}
		},
		isEligible: (attributes: { blockName: string }) => typeof attributes.blockName === 'string',
	}
}

export const deprecateUnescapedCode = (settings: { attributes: any; supports: any }) => {
	const oldAttributes = { ...settings.attributes }
	oldAttributes.content = decodeURIComponent(oldAttributes.content)

	return {
		attributes: oldAttributes,
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
			content: encodeURIComponent(attributes.content),
		}),
		isEligible: (attributes: any) => typeof attributes.content === 'string' && decodeURIComponent(attributes.content) === attributes.content,
	}
}
