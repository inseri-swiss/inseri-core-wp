import { useBlockProps } from '@wordpress/block-editor'
import stringify from 'json-stable-stringify'

export const deprecateBlockName = (settings: { attributes: any; supports: any }) => ({
	attributes: settings.attributes,
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
})
