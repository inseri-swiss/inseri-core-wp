import domReady from '@wordpress/dom-ready'
import { render } from '@wordpress/element'
import { TextEditorView } from './Component'
import { InseriThemeProvider } from '../../components'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-text-editor')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			render(
				<InseriThemeProvider>
					<TextEditorView attributes={attributes} />
				</InseriThemeProvider>,
				item
			)
		})
	}
}

domReady(initReactComponents)
