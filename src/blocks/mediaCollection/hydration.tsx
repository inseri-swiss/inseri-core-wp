import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import View from './view'
import { InseriThemeProvider, StateProvider } from '../../components'
import { storeCreator } from './state'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-media-collection')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<StateProvider stateCreator={storeCreator} initialState={attributes}>
						<View />
					</StateProvider>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
