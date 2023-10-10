import { loadPyodide, PyodideInterface } from 'pyodide'
import { Action } from './WorkerActions'

// version must match with npm package version
const BINARY_URL = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'

let pyodide: PyodideInterface | null = null
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

			if (pyodide) {
				postMessage({ type: 'STATUS', payload: 'ready' })
			}
		}
	}

	if (data.type === 'SET_OUTPUTS') {
		outputs = data.payload
	}
}

function mapSetToArray(set: Set<any>): any[] {
	const newArray = Array.from(set)
	return newArray.map((i: any) => (i instanceof Set ? mapSetToArray(i) : i))
}

function retrievePyObjects(name: string): [string, any] {
	const data = pyodide!.globals.get(name)
	let convertedData = data

	try {
		if (data instanceof pyodide!.ffi.PyProxy) {
			convertedData = data.toJs({ dict_converter: Object.fromEntries })
			data.destroy()
		}

		if (convertedData instanceof Set) {
			convertedData = mapSetToArray(convertedData)
		}

		if (convertedData instanceof pyodide!.ffi.PyProxy) {
			stdBuffer.push(name + ' is not JSON serializable')
			return [name, null]
		}

		return [name, convertedData]
	} catch (error) {
		const msg = error instanceof Error ? error.message : name + ': unknown type conversion error ocurred'
		stdBuffer.push(msg)
		return [name, null]
	}
}

async function init() {
	pyodide = await loadPyodide({
		indexURL: BINARY_URL,
		stdout: (msg) => stdBuffer.push(msg),
		stderr: (msg) => stdBuffer.push(msg),
	})

	if (areInputsInitiated) {
		postMessage({ type: 'STATUS', payload: 'ready' })
	}
}

async function runCode(code: string) {
	try {
		if (pyodide) {
			stdBuffer.splice(0, stdBuffer.length)
			postMessage({ type: 'STATUS', payload: 'in-progress' })

			Object.entries(inputs).forEach(async ([k, v]) => {
				let convertedData = v
				if (convertedData instanceof Blob) {
					convertedData = await convertedData.arrayBuffer()
				}

				pyodide?.globals.set(k, pyodide.toPy(convertedData))
			})

			await pyodide.loadPackagesFromImports(code)
			await pyodide.runPythonAsync(code)

			const results = outputs.map(retrievePyObjects).reduce((acc, [name, val]) => {
				acc[name] = val
				return acc
			}, {} as any)

			postMessage({ type: 'SET_RESULTS', payload: results })
		}
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'unknown error ocurred'
		stdBuffer.push(msg)
	} finally {
		postMessage({ type: 'SET_STD_STREAM', payload: stdBuffer.filter(Boolean).join('\n') })
		postMessage({ type: 'STATUS', payload: 'ready' })
	}
}

init()
