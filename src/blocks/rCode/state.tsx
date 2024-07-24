import { immer } from 'zustand/middleware/immer'
import { CommonCodeState } from '../../components'
import { Attributes } from './index'
import { WebR, REnvironment, isRDouble, isRCharacter, isRList, isRInteger, isRRaw, isRLogical, isRComplex, isRSymbol, isRPairlist } from 'webr'

export interface GlobalState extends Attributes, CommonCodeState {
	worker: any
	webR: WebR
	outputRecord: Record<string, any>
	outputRevision: number
}

const convertRObject =
	(env: REnvironment) =>
	async (name: string): Promise<[string, any]> => {
		const rVariable = await env.get(name)
		let jsVariable: any

		if (isRDouble(rVariable) || isRInteger(rVariable) || isRRaw(rVariable)) {
			jsVariable = await rVariable.toNumber()
		} else if (isRCharacter(rVariable) || isRSymbol(rVariable)) {
			jsVariable = await rVariable.toString()
		} else if (isRLogical(rVariable)) {
			jsVariable = await rVariable.toBoolean()
		} else if (isRComplex(rVariable)) {
			jsVariable = await rVariable.toComplex()
		} else if (isRList(rVariable) || isRPairlist(rVariable)) {
			jsVariable = await rVariable.toArray()
		} else {
			jsVariable = await rVariable.toJs({ depth: 0 /*  infinite */ })
		}

		return [name, jsVariable]
	}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = initalState.mode === 'editor' || (!!initalState.mode && !!initalState.inputCode)
	const newWebR = new WebR({ interactive: false, channelType: 3 })

	return immer<GlobalState>((set, get) => {
		newWebR.init().then(() => {
			set((state) => {
				state.workerStatus = 'ready'
			})
		})

		return {
			...initalState,

			webR: newWebR,
			outputRecord: {},
			outputRevision: 0,

			worker: undefined,
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

				setInputEmpty: (name: string, isRemoved: boolean) => {
					set((state) => {
						state.inputerr = isRemoved ? `Input for ${name} is not available anymore` : `Input for ${name} is not ready`
						state.hasInputError[name] = true
					})
				},

				setInputValue: (name: string, val: any) => {
					set((state) => {
						state.inputRecord[name] = val
						state.inputRevision++

						state.hasInputError[name] = false
						const hasNoError = Object.values(state.hasInputError).every((b) => !b)
						if (hasNoError) {
							state.inputerr = ''
						}
					})
				},

				runCode: async (code: string) => {
					set((state) => {
						state.stdStream = ''
						state.workerStatus = 'in-progress'
					})

					const { webR, inputRecord, outputs } = get()

					let outputRecord = {}
					let env

					try {
						env = await new webR.REnvironment(inputRecord)
					} catch (error) {
						const emptyRecord = Object.keys(inputRecord).reduce((acc, key) => ({ ...acc, [key]: null }), {})
						env = await new webR.REnvironment(emptyRecord)

						let message = 'trouble in converting the inputs'
						if (error instanceof Error) {
							message = error.message
						}

						set((state) => {
							state.stdStream = message
						})
					}

					const shelter = await new webR.Shelter()
					let stdStream = ''

					try {
						const capture = await shelter.captureR(code, { env })
						const converter = convertRObject(env)
						outputRecord = (await Promise.all(outputs.map((o) => converter(o[0])))).reduce((acc, [name, val]) => {
							acc[name] = val
							return acc
						}, {} as any)

						stdStream = capture.output
							.filter((m) => m.type === 'stdout' || m.type === 'stderr')
							.map((m) => m.data)
							.filter(Boolean)
							.join('\n')
					} finally {
						shelter.purge()
					}

					set((state) => {
						state.workerStatus = 'ready'
						state.outputRecord = outputRecord
						state.outputRevision++
						state.stdStream = stdStream
					})
				},

				terminate: () => {
					get().worker.terminate()
					set((state) => {
						state.workerStatus = 'initial'
						//state.worker = createWorker(set)
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
