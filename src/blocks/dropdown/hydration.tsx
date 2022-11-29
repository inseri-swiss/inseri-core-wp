import domReady from '@wordpress/dom-ready'
import { render } from '@wordpress/element'
import { DropdownView } from './Component'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-dropdown')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			render(<DropdownView attributes={attributes} />, item)
		})
	}
}

domReady(initReactComponents)
