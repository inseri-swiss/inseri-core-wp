import domReady from '@wordpress/dom-ready'
import lighthouse from './lighthouse'

declare global {
	interface Window {
		wp: { blockEditor: any }
		inseri: {
			lighthouse: typeof lighthouse
		}
	}
}

domReady(() => {
	window.inseri = {
		lighthouse,
	}
})
