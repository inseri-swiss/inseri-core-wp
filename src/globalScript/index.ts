import domReady from '@wordpress/dom-ready'
import lighthouse from './lighthouse'

type Inseri = {
	lighthouse: typeof lighthouse
}

declare global {
	interface Window {
		wp: { blockEditor: any }
		inseri: Inseri
	}
	const inseri: Inseri
}

domReady(() => {
	window.inseri = {
		lighthouse,
	}
})
