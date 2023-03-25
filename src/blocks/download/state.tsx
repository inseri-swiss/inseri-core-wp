import { immer } from 'zustand/middleware/immer'
import { updatePartially } from '../../utils'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	downloadLink: string

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		updateDownloadObject: (blob: Blob) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: !initalState.input.key,
		downloadLink: '',

		actions: {
			updateState: (modifier: RecursivePartial<GlobalState>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),

			updateDownloadObject: (blob: Blob) => {
				set((state) => {
					URL.revokeObjectURL(state.downloadLink)
					state.downloadLink = URL.createObjectURL(blob)
				})
			},
		},
	}))
}
