import { InseriRoot } from '@inseri/lighthouse'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider, StateProvider } from '../../components'
import config from './block.json'
import { storeCreator } from './state'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-slider')
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
