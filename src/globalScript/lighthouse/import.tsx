import { initJsonValidator } from '../utils'
import { restorableDispatchRoot, restorableDataRoot } from './core'

const schema = {
	type: 'object',
	additionalProperties: {
		type: 'object',
		additionalProperties: {},
	},
}

const isValidJson = initJsonValidator(schema)

window.addEventListener('hashchange', () => {
	importFromUrl(location.hash)
})

document.addEventListener('DOMContentLoaded', () => {
	importFromUrl(location.hash)
})

function importFromUrl(hash: string) {
	const hashContent = hash.slice(1)

	let jsonContent
	try {
		jsonContent = JSON.parse(decodeURIComponent(hashContent))
	} catch {
		// if hashtag is not json, simply skip
		return
	}

	if (!isValidJson(jsonContent)) {
		return
	}

	Object.entries(jsonContent).forEach((blockEntry: any) => {
		const [blockId, block] = blockEntry
		Object.entries(block).forEach((slice: any) => {
			const [key, value] = slice

			if (restorableDispatchRoot[blockId]?.[key]) {
				restorableDispatchRoot[blockId][key](value)
			} else {
				const old = restorableDataRoot[blockId]
				restorableDataRoot[blockId] = { ...old, [key]: value }
			}
		})
	})
}
