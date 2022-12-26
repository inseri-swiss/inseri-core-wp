import { ConsumerBeacon } from '../../globalScript'
import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'

type Tab = 'editor' | 'viewer'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	prevContentType: string
	selectedTab: Tab
	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		setContentType: (contentType: string) => void
		chooseInputBeacon: (beacon: ConsumerBeacon) => void
	}
}

export const storeCreator = (initalState: GlobalState) => {
	const isValueSet = !!initalState.output.contentType || !!initalState.input.key

	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: !isValueSet,
		prevContentType: initalState.output.contentType,
		selectedTab: initalState.mode,

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
					state.mode = 'editor'
					state.input.key = ''
					state.prevContentType = state.output.contentType
					state.output.contentType = contentType
				}),

			chooseInputBeacon: (beacon: ConsumerBeacon) =>
				set((state) => {
					state.isWizardMode = false
					state.input = beacon
					state.mode = 'viewer'
					state.prevContentType = state.output.contentType
					state.output.contentType = ''
				}),
		},
	}))
}
