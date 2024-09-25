import { immer } from 'zustand/middleware/immer'
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
			updateState: (modifier: Partial<GlobalState>) =>
				set((state) => {
					Object.keys(modifier).forEach((k) => {
						state[k] = modifier[k]
					})
				}),
		},
	}))
}
