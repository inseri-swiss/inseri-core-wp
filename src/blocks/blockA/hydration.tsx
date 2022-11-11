import ReactDOM from 'react-dom'
import { Component } from './Component'
import domReady from '@wordpress/dom-ready'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-block-a')
	if (items) {
		Array.from(items).forEach((item) => {
			const attributes = JSON.parse((item as any).dataset.attributes)
			ReactDOM.render(<Component attributes={attributes} />, item)
		})
	}
}

domReady(initReactComponents)
