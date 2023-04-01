import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	prevContentType: string
	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		setContentType: (contentType: string) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = !!initalState.output.contentType

	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: !isValueSet,
		prevContentType: initalState.output.contentType,

		actions: {
			updateState: (modifier: Partial<GlobalState>) =>
				set((state) => {
					Object.keys(modifier).forEach((k) => {
						state[k] = modifier[k]
					})
				}),

			setContentType: (contentType: string) =>
				set((state) => {
					state.isWizardMode = false
					state.prevContentType = state.output.contentType
					state.output.contentType = contentType
				}),
		},
	}))
}
