import { InseriRoot } from '@inseri/lighthouse-next'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider, StateProvider } from '../../components'
import { datasourceStoreCreator } from './AdminState'
import View from './view'
import json from './block.json'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-web-api')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
						<StateProvider stateCreator={datasourceStoreCreator} initialState={attributes}>
							<View />
						</StateProvider>
					</InseriRoot>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
