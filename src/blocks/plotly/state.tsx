import { immer } from 'zustand/middleware/immer'
import { updatePartially } from '../../utils'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	revision: number

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		setHeight: (height: number) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: !initalState.inputFull.key,
		revision: 0,

		actions: {
			updateState: (modifier: RecursivePartial<GlobalState>) => {
				set((state) => {
					updatePartially(state, modifier)
				})
			},

			setHeight: (height: number) => {
				set((state) => {
					state.height = height
					state.revision++
				})
			},
		},
	}))
}
