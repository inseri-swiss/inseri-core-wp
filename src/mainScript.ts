import domReady from '@wordpress/dom-ready'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { nanoid } from 'nanoid/non-secure'

declare global {
	interface Window {
		InseriCore: InseriCore
	}
}

interface StoreSource {
	contentType: string
	isContentTypeDynamic?: boolean
	description: string
	status: 'initial' | 'loading' | 'ready' | 'error' | 'unavailable'
}
type InsertSource = Omit<StoreSource, 'status'> & {
	key: string
}

interface StoreWrapper {
	meta: Record<string, { blockName: string; description: string }>
	//             slice          key
	stores: Record<string, Record<string, StoreSource>>
}

class InseriCore {
	#internalStore

	constructor() {
		this.#internalStore = create(
			devtools(
				immer<StoreWrapper>((_set) => ({ meta: {}, stores: {} })),
				{ name: 'inseri-store' }
			)
		)
	}

	#generateToken = () => nanoid()

	addBlock(blockName: string, fields: InsertSource[]): string {
		const blockHandle = this.#generateToken()

		this.#internalStore.setState((state) => {
			const slice: Record<string, StoreSource> = {}
			fields.forEach((field) => {
				const { key, ...rest } = field
				slice[key] = { ...rest, status: 'initial' }
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
			const slice = state.stores[blockHandle]
			Object.keys(slice).forEach((k) => {
				slice[k].status = 'unavailable'
			})
		})
	}

	addField(blockHandle: string, field: InsertSource) {
		this.#internalStore.setState((state) => {
			const { key, ...rest } = field
			state.stores[blockHandle][key] = { ...rest, status: 'initial' }
		})
	}

	removeField(blockHandle: string, key: string) {
		this.#internalStore.setState((state) => {
			state.stores[blockHandle][key].status = 'unavailable'
		})
	}
}

domReady(() => {
	window.InseriCore = new InseriCore()
})
