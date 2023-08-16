import type { Action, Root } from './types'

export function reducer(base: Root, action: Action) {
	base = { ...base }
	const { blockId } = action.payload

	let blockSlice = { ...base[blockId] }
	blockSlice.values = { ...blockSlice.values }

	switch (action.type) {
		case 'update-block-slice':
			{
				const { blockName, blockType } = action.payload

				if (!blockSlice) {
					blockSlice = { state: 'ready', values: {}, blockName, blockType }
				}

				blockSlice = { ...blockSlice, blockName, blockType }
			}
			break

		case 'add-value-infos':
			{
				const { keys, descriptions } = action.payload
				keys.forEach((key, idx) => {
					blockSlice.values[key] = { description: descriptions[idx], type: 'none' }
				})
			}
			break
		case 'update-value-infos':
			{
				const { keys, descriptions } = action.payload
				keys.forEach((key, idx) => {
					blockSlice.values[key] = { ...blockSlice.values[key], description: descriptions[idx] }
				})
			}
			break
		case 'remove-value-infos':
			{
				const { keys } = action.payload
				const RemainingValueEntries = Object.entries(blockSlice.values).filter(([entryKey]) => !keys.includes(entryKey))
				blockSlice.values = Object.fromEntries(RemainingValueEntries)
			}
			break
		case 'set-value':
			{
				const { key, value, contentType } = action.payload
				const wrapper = blockSlice.values[key]
				blockSlice.values[key] = { description: wrapper.description, type: 'wrapper', value, contentType }
			}
			break
		case 'set-empty':
			{
				const { key } = action.payload
				const wrapper = blockSlice.values[key]
				blockSlice.values[key] = { description: wrapper.description, type: 'none' }
			}
			break
	}

	base[blockId] = blockSlice
	return base
}
