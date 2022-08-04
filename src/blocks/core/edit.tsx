import React from 'react'
import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import './editor.scss'

export default function Edit() {
	return (
		<p {...useBlockProps()}>
			<a
				target="_blank"
				href="https://gitlab.com/bigaru/calx/-/blob/master/.eslintrc.js"
			>
				foo
			</a>
			{__('Inseri Core – hello from the editor!', 'core')}
		</p>
	)
}
