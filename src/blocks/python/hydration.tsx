import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { InseriThemeProvider, StateProvider } from '../../components'
import { storeCreator } from './state'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-python')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<StateProvider stateCreator={storeCreator} initialState={attributes}>
						<View attributes={attributes} />
					</StateProvider>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
