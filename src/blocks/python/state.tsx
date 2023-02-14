import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	pyWorker: Worker
	isWorkerReady: boolean
	stdout: string
	stderr: string
	result: any

	isModalOpen: boolean
	isWizardMode: boolean
	selectedMode: 'editor' | 'viewer'
	wizardStep: number
	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		runCode: () => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = initalState.mode === 'editor' || (!!initalState.mode && initalState.input.key)
	const pyWorker = new Worker(new URL(inseriApiSettings.worker))

	return immer<GlobalState>((set, get) => {
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

			isModalOpen: false,
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

				runCode: () => {
					set((state) => {
						state.stderr = ''
						state.stdout = ''
					})

					const code = get().content
					pyWorker.postMessage({ code })
				},
			},
		}
	})
}
