import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import './editor.scss'
import { Button } from '../../component-library/button'

export default function Edit() {
	return (
		<p {...useBlockProps()}>
			<Button
				onPress={() => {
					console.log('Button pressed') // eslint-disable-line no-console
				}}
				className={'inseri-is-danger'}
			>
				A11y click
			</Button>
			{__('Inseri Core – hello from the editor!', 'core')}
		</p>
	)
}
