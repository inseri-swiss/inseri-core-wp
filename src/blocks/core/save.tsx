import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'

export default function save({ attributes }: BlockSaveProps<any>) {
	return (
		<div {...useBlockProps.save()} data-attributes={JSON.stringify(attributes)}>
			{__('inseri core – hello from the saved content!', 'core')}
		</div>
	)
}
