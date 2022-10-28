import domReady from '@wordpress/dom-ready'

declare global {
	interface Window {
		InseriCore: InseriCore
	}
}

class InseriCore {}

domReady(() => {
	window.InseriCore = new InseriCore()
})
