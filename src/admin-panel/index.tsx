import { render } from '@wordpress/element'
import domReady from '@wordpress/dom-ready'

function init() {
	const root = document.querySelector('#inseri-core-root')
	render(<div></div>, root)
}

domReady(init)
