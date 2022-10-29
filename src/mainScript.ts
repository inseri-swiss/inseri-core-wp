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
	description: string
	status: 'initial' | 'loading' | 'ready' | 'error'
}
type SourceWithKey = Source & {
	key: string
}

interface StoreWrapper {
	meta: Record<string, { blockName: string; description: string }>
	stores: Record<string, Source>
}

class InseriCore {
	#internalStore

	constructor() {
		this.#internalStore = create(immer<StoreWrapper>((_set) => ({ meta: {}, stores: {} })))
	}

	#generateToken = () => Math.random().toString(36).slice(2)

	addBlock(blockName: string, fields: SourceWithKey[]): string {
		let blockHandle = this.#generateToken()
		const currentState = this.#internalStore.getState()

		while (currentState.stores[blockHandle]) {
			blockHandle = this.#generateToken()
		}

		this.#internalStore.setState((state) => {
			const slice: any = {}
			fields.forEach((field) => {
				const { key, ...rest } = field
				slice[key] = rest
			})

			state.meta[blockHandle] = {
				blockName,
				description: '',
			}

			state.stores[blockHandle] = slice
		})

		return blockHandle
	}

	removeBlock(blockHandle: string) {
		this.#internalStore.setState((state) => {
			delete state.meta[blockHandle]
			delete state.stores[blockHandle]
		})
	}
}

domReady(() => {
	window.InseriCore = new InseriCore()
})
