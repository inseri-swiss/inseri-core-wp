import { InseriRoot } from '@inseri/lighthouse'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider, StateProvider } from '../../components'
import json from './block.json'
import { storeCreator } from './state'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-iiif-viewer')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
						<StateProvider stateCreator={storeCreator} initialState={attributes}>
							<View />
						</StateProvider>
					</InseriRoot>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
