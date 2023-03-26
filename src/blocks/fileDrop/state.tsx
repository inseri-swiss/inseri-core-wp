import { immer } from 'zustand/middleware/immer'
import { updatePartially } from '../../utils'
import { Attributes } from './index'
import { generateId } from '@inseri/utils'

export interface GlobalState extends Attributes {
	[i: string]: any

	files: Record<string, File>
	chosenFile: string | undefined
	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		addFiles: (files: File[]) => void
		removeFile: (key: string) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	return immer<GlobalState>((set) => ({
		...initalState,
		files: {},
		chosenFile: undefined,
		actions: {
			updateState: (modifier: RecursivePartial<GlobalState>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),

			addFiles: (files: File[]) => {
				set((state) => {
					files.forEach((f) => {
						state.files[generateId(12)] = f
					})
				})
			},

			removeFile: (key: string) => {
				set((state) => {
					if (key === state.chosenFile) {
						state.chosenFile = undefined
					}
					delete state.files[key]
				})
			},
		},
	}))
}
