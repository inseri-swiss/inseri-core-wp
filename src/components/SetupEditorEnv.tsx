import { useBlockProps } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { useEffect } from '@wordpress/element'
import type { PropsWithChildren } from 'react'
import { generateId } from '@inseri/utils'
import { InseriThemeProvider } from './InseriThemeProvider'

export function SetupEditorEnv(props: PropsWithChildren<BlockEditProps<any>> & { baseBlockName: string }) {
	const { setAttributes, attributes, children, baseBlockName } = props

	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateId() })
		}

		if (!attributes.blockName) {
			setAttributes({ blockName: `${baseBlockName}-${generateId(3)}` })
		}
	}, [])

	return <div {...useBlockProps()}>{attributes.blockId ? <InseriThemeProvider>{children}</InseriThemeProvider> : null}</div>
}
