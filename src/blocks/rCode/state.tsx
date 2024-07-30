import { REnvironment, WebR, isRList, isRCharacter, isRComplex, isRInteger, isRRaw, isRDouble, isRLogical, isRPairlist, isRSymbol } from 'webr'
import { immer } from 'zustand/middleware/immer'
import { CommonCodeState } from '../../components'
import { Attributes } from './index'

export interface GlobalState extends Attributes, CommonCodeState {
	worker: any
	webR: WebR
	outputRecord: Record<string, any>
	outputRevision: number
	imgBlobs: Blob[]
	highestNoImgBlobs: number
}

const transformToJsValue = async (rVariable: any): Promise<any> => {
	if (isRDouble(rVariable) || isRInteger(rVariable) || isRRaw(rVariable) || isRCharacter(rVariable) || isRLogical(rVariable) || isRComplex(rVariable)) {
		const arr = await rVariable.toArray()

		if (arr.length === 1) {
			return arr[0]
		}
		return arr
	}
	if (isRSymbol(rVariable)) {
		return await rVariable.toString()
	}

	if (isRList(rVariable) || isRPairlist(rVariable)) {
		const arr = await rVariable.toArray()
		return await Promise.all(arr.map((e) => transformToJsValue(e)))
	}

	return await rVariable.toJs({ depth: 0 /*  infinite */ })
}

export const storeCreator = (initalState: Attributes) => {
	const isValueSet = initalState.mode === 'editor' || (!!initalState.mode && !!initalState.inputCode)

	return immer<GlobalState>((set, get) => {
		const createWebR = () => {
			const newWebR = new WebR({ interactive: false, channelType: 3 })
			newWebR.init().then(() => {
				set((state) => {
					state.workerStatus = 'ready'
				})
			})

			return newWebR
		}

		return {
			...initalState,

			webR: createWebR(),
			outputRecord: {},
			outputRevision: 0,
			imgBlobs: [],
			highestNoImgBlobs: 0,

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
					let env: REnvironment

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
					let blobs: Blob[] = []

					try {
						const newCode = `
webr::shim_install()\n
jpeg()\n
${code} \n
dev.off()
`
						const capture = await shelter.captureR(newCode, { env })
						const outputValues: [string, any][] = await Promise.all(
							outputs.map(async ([name, _]) => {
								const rVariable = await env.get(name)
								return [name, await transformToJsValue(rVariable)]
							})
						)
						outputRecord = outputValues.reduce((acc, [name, val]) => {
							acc[name] = val
							return acc
						}, {} as any)

						stdStream = capture.output
							.filter((m) => m.type === 'stdout' || m.type === 'stderr')
							.map((m) => m.data)
							.filter(Boolean)
							.join('\n')

						const files = (await webR.FS.lookupPath('/home/web_user')).contents ?? []
						const jpgFiles = Object.values(files)
							.filter((f) => f.name.endsWith('.jpeg'))
							.map((f) => '/home/web_user/' + f.name)

						blobs = await Promise.all(
							jpgFiles.map(async (f) => {
								const content = await webR.FS.readFile(f)
								webR.FS.unlink(f)
								return new Blob([content], { type: 'image/jpeg' })
							})
						)
					} finally {
						shelter.purge()
					}

					set((state) => {
						state.workerStatus = 'ready'
						state.outputRecord = outputRecord
						state.outputRevision++
						state.stdStream = stdStream
						state.imgBlobs = blobs

						if (state.highestNoImgBlobs < blobs.length) {
							state.highestNoImgBlobs = blobs.length
						}
					})
				},

				terminate: () => {
					get().webR.close()
					set((state) => {
						state.workerStatus = 'initial'
						state.webR = createWebR()
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
