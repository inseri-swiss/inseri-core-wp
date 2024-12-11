import { InseriRoot } from '@inseri/lighthouse'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider } from '../../components/InseriThemeProvider'
import { generateQuerySelector } from '../../utils'
import json from './block.json'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll(generateQuerySelector(json.name))
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata?.name ?? ''} blockType={json.name}>
						<View attributes={attributes} />
					</InseriRoot>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
