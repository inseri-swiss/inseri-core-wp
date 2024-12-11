import { InseriRoot } from '@inseri/lighthouse'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider } from '../../components/InseriThemeProvider'
import { StateProvider } from '../../components/StateProvider'
import { generateQuerySelector } from '../../utils'
import json from './block.json'
import { storeCreator } from './state'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll(generateQuerySelector(json.name))
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata?.name ?? ''} blockType={json.name}>
						<StateProvider stateCreator={storeCreator} initialState={attributes}>
							<View attributes={attributes} />
						</StateProvider>
					</InseriRoot>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
