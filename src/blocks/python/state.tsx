import type { Draft } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'
import { Action } from './WorkerActions'

export interface GlobalState extends Attributes {
	[i: string]: any

	pyWorker: Worker
	workerStatus: 'initial' | 'ready' | 'in-progress'
	stdStream: string
	inputerr: string
	hasInputError: Record<string, boolean>
	inputRecord: Record<string, any>
	inputRevision: number

	isModalOpen: boolean
	isWizardMode: boolean
	selectedMode: 'editor' | 'viewer'
	wizardStep: number

	newInputVarName: string
	newOutputVarName: string

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		runCode: (code: string) => void
		terminate: () => void

		addNewInput: () => void
		chooseInput: (variable: string, key: string) => void
		removeInput: (variable: string) => void

		addNewOutput: () => void
		chooseContentType: (variable: string, contentType: string) => void
		removeOutput: (variable: string) => void
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
	const isValueSet = initalState.mode === 'editor' || (!!initalState.mode && !!initalState.inputCode)

	return immer<GlobalState>((set, get) => {
		return {
			...initalState,

			pyWorker: createWorker(set),
			workerStatus: 'initial',
			stdStream: '',
			inputerr: '',
			hasInputError: {},
			inputRecord: {},
			inputRevision: 0,

			isModalOpen: false,
			isWizardMode: !isValueSet,
			selectedMode: initalState.mode ? initalState.mode : 'editor',
			wizardStep: 0,

			newInputVarName: '',
			newOutputVarName: '',
			outputContentTypes: {},

			actions: {
				updateState: (modifier: Partial<GlobalState>) =>
					set((state) => {
						Object.keys(modifier).forEach((k) => {
							state[k] = modifier[k]
						})
					}),

				runCode: (code: string) => {
					set((state) => {
						state.stdStream = ''
					})

					const { pyWorker } = get()
					pyWorker.postMessage({ type: 'RUN_CODE', payload: code })
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
						state.inputs[state.newInputVarName!] = ''
						state.newInputVarName = ''
					})
				},

				chooseInput: (variable: string, key: string) => {
					set((state) => {
						state.inputs[variable] = key
					})
				},

				removeInput: (variable: string) => {
					set((state) => {
						delete state.inputs[variable]
					})
				},

				addNewOutput: () => {
					set((state) => {
						state.outputs.push([state.newOutputVarName, ''])
						state.newOutputVarName = ''
					})
				},

				chooseContentType: (variable: string, contentType: string) => {
					set((state) => {
						const found = state.outputs.find((o) => o[0] === variable)
						if (found) {
							found[1] = contentType
						}
					})
				},

				removeOutput: (variable: string) => {
					set((state) => {
						state.outputs = state.outputs.filter((o) => o[0] !== variable)
					})
				},
			},
		}
	})
}
