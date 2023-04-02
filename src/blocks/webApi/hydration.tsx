import domReady from '@wordpress/dom-ready'
import { render } from '@wordpress/element'
import { WebApiView } from './Component'
import { InseriThemeProvider, StateProvider } from '../../components'
import { datasourceStoreCreator } from './AdminState'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-web-api')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			render(
				<InseriThemeProvider>
					<StateProvider stateCreator={datasourceStoreCreator} initialState={attributes}>
						<WebApiView />
					</StateProvider>
				</InseriThemeProvider>,
				item
			)
		})
	}
}

domReady(initReactComponents)
