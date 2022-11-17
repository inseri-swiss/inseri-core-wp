import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'

export default function save({ attributes }: BlockEditProps<any>) {
	return (
		<div {...useBlockProps.save()} data-attributes={JSON.stringify(attributes)}>
			is loading ...
		</div>
	)
}
