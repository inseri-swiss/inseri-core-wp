import { IconFileTypography } from '@tabler/icons-react'
import { useBlockProps } from '@wordpress/block-editor'
import type { BlockSaveProps } from '@wordpress/blocks'
import { registerBlockType } from '@wordpress/blocks'
import stringify from 'json-stable-stringify'
import { deprecateBlockName } from '../../components/deprecation'
import json from './block.json'
import Edit from './edit'
import './style.scss'
import View from './view'
import ReactDOMServer from 'react-dom/server'
import { InseriThemeProvider, StateProvider } from '../../components'
import { InseriRoot } from '@inseri/lighthouse'
import { storeCreator } from './state'

const { name, ...settings } = json as any

export interface Attributes {
	blockId: string
	inputKey: string
	height: number
	content: string
	label: string
	metadata: {
		name: string
	}
}

const doSSR = (attributes: Attributes) => {
	return ReactDOMServer.renderToString(
		<InseriThemeProvider>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata?.name ?? ''} blockType={name}>
				<StateProvider stateCreator={storeCreator} initialState={attributes}>
					<View />
				</StateProvider>
			</InseriRoot>
		</InseriThemeProvider>
	)
}

registerBlockType<Attributes>(name, {
	...settings,
	edit: Edit,
	save: ({ attributes }: BlockSaveProps<Attributes>) => {
		return <div {...useBlockProps.save()} data-attributes={stringify(attributes)} dangerouslySetInnerHTML={{ __html: doSSR(attributes) }} />
	},
	icon: <IconFileTypography style={{ fill: 'none' }} />,
	deprecated: [deprecateBlockName(settings)],
})
