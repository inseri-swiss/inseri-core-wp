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
