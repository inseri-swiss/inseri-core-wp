import { InseriRoot } from '@inseri/lighthouse-next'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider } from '../../components'
import json from './block.json'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-dropdown')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
						<View attributes={attributes} />
					</InseriRoot>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
