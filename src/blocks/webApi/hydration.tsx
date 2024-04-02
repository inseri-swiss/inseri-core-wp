import { InseriRoot } from '@inseri/lighthouse'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider, StateProvider } from '../../components'
import { generateQuerySelector } from '../../utils'
import { datasourceStoreCreator } from './AdminState'
import json from './block.json'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll(generateQuerySelector(json.name))
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
