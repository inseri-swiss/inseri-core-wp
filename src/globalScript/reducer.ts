import { none } from './option'
import type { Action, Root } from './types'

export function reducer(base: Root, action: Action) {
	base = { ...base }
	const { blockId } = action.payload

	let blockSlice = { ...base[blockId] }
	blockSlice.atoms = { ...blockSlice.atoms }

	switch (action.type) {
		case 'update-block-slice':
			{
				const { blockName, blockType } = action.payload

				if (!blockSlice) {
					blockSlice = { state: 'ready', atoms: {}, blockName, blockType }
				}

				blockSlice = { ...blockSlice, blockName, blockType }
			}
			break

		case 'add-value-infos':
			{
				const { keys, descriptions } = action.payload
				keys.forEach((key, idx) => {
					blockSlice.atoms[key] = { description: descriptions[idx], content: none }
				})
			}
			break
		case 'update-value-infos':
			{
				const { keys, descriptions } = action.payload
				keys.forEach((key, idx) => {
					blockSlice.atoms[key] = { ...blockSlice.atoms[key], description: descriptions[idx] }
				})
			}
			break
		case 'remove-value-infos':
			{
				const { keys } = action.payload
				const RemainingValueEntries = Object.entries(blockSlice.atoms).filter(([entryKey]) => !keys.includes(entryKey))
				blockSlice.atoms = Object.fromEntries(RemainingValueEntries)
			}
			break
		case 'remove-all-value-infos':
			{
				blockSlice.atoms = {}
			}
			break
		case 'set-value':
			{
				const { key, content } = action.payload
				const wrapper = blockSlice.atoms[key]
				blockSlice.atoms[key] = { description: wrapper.description, content }
			}
			break
	}

	base[blockId] = blockSlice
	return base
}
