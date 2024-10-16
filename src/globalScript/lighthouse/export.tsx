import { restorableDataRoot } from './core'

export function exportAsJson(): string {
	const blockEntries = Object.entries(restorableDataRoot)
		.filter(([_, block]) => Object.values(block).length > 0)
		.map(([blockId, block]) => {
			const entries = Object.entries(block).filter(([_, slice]) => !(slice instanceof Blob) && !(slice instanceof Uint8Array))

			return [blockId, Object.fromEntries(entries)]
		})

	return JSON.stringify(Object.fromEntries(blockEntries))
}
