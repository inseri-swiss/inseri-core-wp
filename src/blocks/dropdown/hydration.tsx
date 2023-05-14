import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import View from './view'
import { InseriThemeProvider } from '../../components'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-dropdown')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<View attributes={attributes} />
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
