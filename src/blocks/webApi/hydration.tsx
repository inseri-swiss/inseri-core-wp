import domReady from '@wordpress/dom-ready'
import { render } from '@wordpress/element'
import { WebApiView } from './Component'
import { InseriThemeProvider } from '../../components'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-web-api')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			render(
				<InseriThemeProvider>
					<WebApiView attributes={attributes} />
				</InseriThemeProvider>,
				item
			)
		})
	}
}

domReady(initReactComponents)
