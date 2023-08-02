import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import View from './view'
import { InseriThemeProvider, StateProvider } from '../../components'
import { storeCreator } from './state'
import { InseriRoot } from '@inseri/lighthouse-next'
import config from './block.json'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-download')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<StateProvider stateCreator={storeCreator} initialState={attributes}>
						<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={config.name}>
							<View />
						</InseriRoot>
					</StateProvider>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
