import { ConsumerBeacon } from '@inseri/lighthouse'
import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'
import { Action } from './WorkerActions'

export interface GlobalState extends Attributes {
	[i: string]: any

	pyWorker: Worker
	workerStatus: 'initial' | 'ready' | 'in-progress'
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
		pyWorker.addEventListener('message', ({ data }: MessageEvent<Action>) => {
			set((state) => {
				if (data.type === 'STATUS') {
					state.workerStatus = data.payload
				}
				if (data.type === 'SET_STD_ERR') {
					state.stderr = data.payload
				}
				if (data.type === 'SET_STD_OUT') {
					state.stdout = data.payload
				}
			})
		})

		return {
			...initalState,

			pyWorker,
			workerStatus: 'initial',
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
					pyWorker.postMessage({ type: 'RUN_CODE', payload: code })
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
