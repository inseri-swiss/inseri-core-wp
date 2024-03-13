import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		chooseInput: (key: string) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = !!initalState.inputKey

	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: !isValueSet,

		actions: {
			updateState: (modifier: Partial<GlobalState>) =>
				set((state) => {
					Object.keys(modifier).forEach((k) => {
						state[k] = modifier[k]
					})
				}),

			chooseInput: (key: string) =>
				set((state) => {
					state.isWizardMode = !key
					state.inputKey = key
				}),
		},
	}))
}
