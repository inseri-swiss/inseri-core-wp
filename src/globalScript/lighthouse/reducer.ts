import { none } from './option'
import type { Action, Root } from './types'

export function reducer(base: Root, action: Action) {
	base = { ...base }
	const { blockId } = action.payload

	if (!blockId) {
		return base
	}

	let blockSlice = { ...base[blockId] }
	blockSlice.atoms = { ...blockSlice.atoms }

	switch (action.type) {
		case 'update-block-slice':
			{
				const { blockName, blockType, clientId } = action.payload

				if (!blockSlice) {
					blockSlice = { state: 'ready', atoms: {}, blockName, blockType, clientId }
				}

				blockSlice = { ...blockSlice, blockName, blockType, clientId }
				base[blockId] = blockSlice
			}
			break

		case 'add-value-infos':
			{
				const { keys, descriptions } = action.payload
				keys.forEach((key, idx) => {
					blockSlice.atoms[key] = { description: descriptions[idx], content: none }
				})
				base[blockId] = blockSlice
			}
			break
		case 'update-value-infos':
			{
				const { keys, descriptions } = action.payload
				keys.forEach((key, idx) => {
					blockSlice.atoms[key] = { ...blockSlice.atoms[key], description: descriptions[idx] }
				})
				base[blockId] = blockSlice
			}
			break
		case 'remove-value-infos':
			{
				const { keys } = action.payload
				const RemainingValueEntries = Object.entries(blockSlice.atoms).filter(([entryKey]) => !keys.includes(entryKey))
				blockSlice.atoms = Object.fromEntries(RemainingValueEntries)
				base[blockId] = blockSlice
			}
			break
		case 'remove-all-value-infos':
			{
				const { [blockId]: _blockSlice, ...rest } = base
				base = rest
			}
			break
		case 'set-value':
			{
				const { key, content } = action.payload
				const wrapper = blockSlice.atoms[key]
				blockSlice.atoms[key] = { description: wrapper.description, content }
				base[blockId] = blockSlice
			}
			break
	}

	return base
}
