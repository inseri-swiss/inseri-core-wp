import { render } from '@wordpress/element'
import domReady from '@wordpress/dom-ready'
import AdminPanel from './AdminPanel'

function init() {
	const root = document.querySelector('#inseri-core-root')
	render(<AdminPanel />, root)
}

domReady(init)
