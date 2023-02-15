import { ConsumerBeacon } from '@inseri/lighthouse'
import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'

export interface GlobalState extends Attributes {
	[i: string]: any

	pyWorker: Worker
	isWorkerReady: boolean
	stdout: string
	stderr: string
	result: any
	blockerr: string

	isModalOpen: boolean
	isWizardMode: boolean
	selectedMode: 'editor' | 'viewer'
	wizardStep: number

	newVarName: string

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		runCode: () => void
		addNewInput: () => void
		chooseInput: (variable: string, beacon: ConsumerBeacon) => void
		removeInput: (variable: string) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = initalState.mode === 'editor' || (!!initalState.mode && initalState.inputCode.key)
	const pyWorker = new Worker(new URL(inseriApiSettings.worker))

	return immer<GlobalState>((set, get) => {
		pyWorker.addEventListener('message', ({ data }) => {
			if (['isWorkerReady', 'stdout', 'stderr', 'result'].some((e) => Object.hasOwn(data, e))) {
				set((state) => {
					Object.entries(data).forEach(([k, v]) => {
						state[k] = v
					})
				})
			}
		})

		return {
			...initalState,

			pyWorker,
			isWorkerReady: false,
			stderr: '',
			stdout: '',
			result: null,
			blockerr: '',

			isModalOpen: false,
			isWizardMode: !isValueSet,
			selectedMode: initalState.mode ? initalState.mode : 'editor',
			wizardStep: 0,

			newVarName: '',

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

				addNewInput: () => {
					set((state) => {
						state.inputs[state.newVarName!] = { key: '', contentType: '', description: '' }
						state.newVarName = ''
					})
				},

				chooseInput: (variable: string, beacon: ConsumerBeacon) => {
					set((state) => {
						state.inputs[variable] = beacon
					})
				},

				removeInput: (variable: string) => {
					set((state) => {
						delete state.inputs[variable]
					})
				},
			},
		}
	})
}
