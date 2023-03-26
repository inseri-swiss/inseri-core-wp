import { immer } from 'zustand/middleware/immer'
import { updatePartially } from '../../utils'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	return immer<GlobalState>((set) => ({
		...initalState,

		actions: {
			updateState: (modifier: RecursivePartial<GlobalState>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),
		},
	}))
}
