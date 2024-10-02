import { initJsonValidator } from '../utils'
import { onNext } from './core'
import { some } from './option'

const schema = {
	type: 'object',
	additionalProperties: {
		type: 'object',
		additionalProperties: {
			type: 'object',
			required: [
				'contentType',
				'value',
			],
			properties: {
				contentType: { type: 'string' },
				value: {},
			},
		},
	},
}

const isValidJson = initJsonValidator(schema)

window.addEventListener('hashchange', (_event) => {
	importFromUrl(location.hash)
})

window.addEventListener('load', async () => {
	importFromUrl(location.hash)
})

function importFromUrl(hash: string) {
	const hashContent = hash.slice(1)

	let jsonContent
	try {
		jsonContent = JSON.parse(decodeURIComponent(hashContent))
	} catch (error) {
		// if hashtag is not json, simply skip
		return
	}

	if (!isValidJson(jsonContent)) {
		return
	}

	Object.entries(jsonContent).forEach((blockEntry: any) => {
		const [blockId, block] = blockEntry
		Object.entries(block).forEach((atomEntry: any) => {
			const [key, atom] = atomEntry
			const { contentType, value } = atom
			onNext({ type: 'set-value', payload: { blockId, key, content: some({ contentType, value }) } })
		})
	})
}
