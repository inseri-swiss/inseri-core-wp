import { immer } from 'zustand/middleware/immer'
import { updatePartially } from '../../utils'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	isBlob: boolean
	isPrevBlob: boolean
	imageUrl: string
	prevImageUrl: string
	hasError: boolean

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: !initalState.input.key,
		isBlob: false,
		isPrevBlob: false,
		imageUrl: '',
		prevImageUrl: '',
		hasError: false,

		actions: {
			updateState: (modifier: RecursivePartial<GlobalState>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),
		},
	}))
}
