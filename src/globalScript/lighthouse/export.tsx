import { FILTER_PRIVATE, blockStoreSubject } from './core'

export function exportAsJson(): any {
	const root = blockStoreSubject.getValue()

	const blockEntries = Object.entries(root)
		.filter(([blockId]) => !blockId.startsWith(FILTER_PRIVATE))
		.filter(([_, block]) => Object.values(block.atoms).length > 0)
		.map(([blockId, block]) => {
			const entries = Object.entries(block.atoms)
				.filter(([_, atom]) => atom.content.exists((a) => !(a instanceof Blob)))
				.map(([key, atom]) => [
					key,
					atom.content.fold(
						() => null,
						(n) => n
					),
				])
			return [blockId, Object.fromEntries(entries)]
		})

	return JSON.stringify(Object.fromEntries(blockEntries))
}
