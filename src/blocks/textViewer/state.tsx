import { ConsumerBeacon } from '../../globalScript'
import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		chooseInputBeacon: (beacon: ConsumerBeacon) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = !!initalState.input.key

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

			chooseInputBeacon: (beacon: ConsumerBeacon) =>
				set((state) => {
					state.isWizardMode = false
					state.input = beacon
				}),
		},
	}))
}
