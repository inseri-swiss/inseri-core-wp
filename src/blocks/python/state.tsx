import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	pyWorker: Worker
	isWorkerReady: boolean
	stdout: string
	stderr: string
	result: any

	isWizardMode: boolean
	selectedMode: 'editor' | 'viewer'
	wizardStep: number
	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = initalState.mode === 'editor' || (!!initalState.mode && initalState.input.key)
	const pyWorker = new Worker(new URL(inseriApiSettings.worker))

	return immer<GlobalState>((set) => {
		pyWorker.onmessage = ({ data }) => {
			set((state) => {
				Object.entries(data).forEach(([k, v]) => {
					state[k] = v
				})
			})
		}

		return {
			...initalState,

			pyWorker,
			isWorkerReady: false,
			stderr: '',
			stdout: '',
			result: null,

			isWizardMode: !isValueSet,
			selectedMode: initalState.mode ? initalState.mode : 'editor',
			wizardStep: 0,

			actions: {
				updateState: (modifier: Partial<GlobalState>) =>
					set((state) => {
						Object.keys(modifier).forEach((k) => {
							state[k] = modifier[k]
						})
					}),
			},
		}
	})
}
