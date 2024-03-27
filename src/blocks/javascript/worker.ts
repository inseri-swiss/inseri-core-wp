import { Action } from './WorkerActions'

let inputs: Record<string, any> = {}
let outputs: string[] = []
const stdBuffer: string[] = []

let areInputsInitiated = false

onmessage = ({ data }: MessageEvent<Action>) => {
	if (data.type === 'RUN_CODE') {
		runCode(data.payload)
	}

	if (data.type === 'SET_INPUTS') {
		inputs = data.payload

		if (!areInputsInitiated) {
			areInputsInitiated = true

			postMessage({ type: 'STATUS', payload: 'ready' })
		}
	}

	if (data.type === 'SET_OUTPUTS') {
		outputs = data.payload
	}
}

async function runCode(code: string) {
	try {
		stdBuffer.splice(0, stdBuffer.length)
		postMessage({ type: 'STATUS', payload: 'in-progress' })

		// TODO run code
		console.log(code)

		const results = {}

		postMessage({ type: 'SET_RESULTS', payload: results })
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'unknown error ocurred'
		stdBuffer.push(msg)
	} finally {
		postMessage({ type: 'SET_STD_STREAM', payload: stdBuffer.filter(Boolean).join('\n') })
		postMessage({ type: 'STATUS', payload: 'ready' })
	}
}
