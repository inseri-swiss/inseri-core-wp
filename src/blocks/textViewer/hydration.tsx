import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider, StateProvider } from '../../components'
import { storeCreator } from './state'
import View from './view'
import { InseriRoot } from '@inseri/lighthouse-next'
import config from './block.json'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-text-viewer')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={config.name}>
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
