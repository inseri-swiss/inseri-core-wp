import { InseriRoot } from '@inseri/lighthouse'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider, StateProvider } from '../../components'
import { generateQuerySelector } from '../../utils'
import config from './block.json'
import { storeCreator } from './state'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll(generateQuerySelector(config.name))
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<StateProvider stateCreator={storeCreator} initialState={attributes}>
						<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={config.name}>
							<View />
						</InseriRoot>
					</StateProvider>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
