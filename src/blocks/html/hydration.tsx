import domReady from '@wordpress/dom-ready'
import { render } from '@wordpress/element'
import { HtmlView } from './Component'
import { InseriThemeProvider, StateProvider } from '../../components'
import { storeCreator } from './state'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-html')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			render(
				<InseriThemeProvider>
					<StateProvider stateCreator={storeCreator} initialState={attributes}>
						<HtmlView />
					</StateProvider>
				</InseriThemeProvider>,
				item
			)
		})
	}
}

domReady(initReactComponents)
