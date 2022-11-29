import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'
import { useEffect } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { generateId } from '@inseri/utils'
import { InseriThemeProvider } from './InseriThemeProvider'

export function SetupEditorEnv(props: PropsWithChildren<BlockEditProps<any>> & { blockIdName?: string }) {
	const { setAttributes, attributes, blockIdName = 'blockId', children } = props

	useEffect(() => {
		if (!attributes[blockIdName]) {
			setAttributes({ [blockIdName]: generateId() })
		}
	}, [])

	return <div {...useBlockProps()}>{attributes[blockIdName] ? <InseriThemeProvider>{children}</InseriThemeProvider> : null}</div>
}
