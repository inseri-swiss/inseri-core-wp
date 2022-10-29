import domReady from '@wordpress/dom-ready'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'

declare global {
	interface Window {
		InseriCore: InseriCore
	}
}

interface Source {
	contentType: string
	isContentTypeDynamic?: boolean
	key: string
	description: string
	status: 'initial' | 'loading' | 'ready' | 'error'
}

class InseriCore {
	#internalStore
	useStore

	constructor() {
		this.#internalStore = create(immer<any>((_set) => ({ meta: {} })))
		this.useStore = this.#internalStore
	}

	#generateToken = () => Math.random().toString(36).slice(2)

	addBlock(blockName: string, fields: Source[]): string {
		let blockHandle = this.#generateToken()
		const state = this.#internalStore.getState()

		while (state[blockHandle]) {
			blockHandle = this.#generateToken()
		}

		this.#internalStore.setState((state: any) => {
			const slice: any = {}
			fields.forEach((field) => {
				const { key, ...rest } = field
				slice[key] = rest
			})

			state.meta[blockHandle] = {
				blockName,
				description: '',
			}

			state[blockHandle] = slice
			return state
		})

		return blockHandle
	}
}

domReady(() => {
	window.InseriCore = new InseriCore()
})
