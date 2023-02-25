import { ConsumerBeacon } from '@inseri/lighthouse'
import type { Draft } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'
import { Action } from './WorkerActions'

export interface GlobalState extends Attributes {
	[i: string]: any

	pyWorker: Worker
	workerStatus: 'initial' | 'ready' | 'in-progress'
	stdStream: string
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
		terminate: () => void
		addNewInput: () => void
		chooseInput: (variable: string, beacon: ConsumerBeacon) => void
		removeInput: (variable: string) => void
	}
}

const createWorker = (set: (nextStateOrUpdater: (state: Draft<GlobalState>) => void) => void) => {
	const worker = new Worker(new URL(inseriApiSettings.worker))

	worker.addEventListener('message', ({ data }: MessageEvent<Action>) => {
		set((state) => {
			if (data.type === 'STATUS') {
				state.workerStatus = data.payload
			}
			if (data.type === 'SET_STD_STREAM') {
				state.stdStream = data.payload
			}
		})
	})

	return worker
}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = initalState.mode === 'editor' || (!!initalState.mode && initalState.inputCode.key)

	return immer<GlobalState>((set, get) => {
		return {
			...initalState,

			pyWorker: createWorker(set),
			workerStatus: 'initial',
			stdStream: '',
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
						state.stdStream = ''
					})

					const { pyWorker, content } = get()
					pyWorker.postMessage({ type: 'RUN_CODE', payload: content })
				},

				terminate: () => {
					get().pyWorker.terminate()
					set((state) => {
						state.workerStatus = 'initial'
						state.pyWorker = createWorker(set)
					})
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
