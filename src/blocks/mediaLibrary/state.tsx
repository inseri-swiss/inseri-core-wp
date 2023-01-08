import { immer } from 'zustand/middleware/immer'
import { updatePartially } from '../../utils'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	selectedFileId: string | null

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: initalState.fileIds.length === 0,
		selectedFileId: null,

		actions: {
			updateState: (modifier: RecursivePartial<GlobalState>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),
		},
	}))
}
