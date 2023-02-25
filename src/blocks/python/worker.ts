import { loadPyodide, PyodideInterface, PyProxy } from 'pyodide'
import { Action } from './WorkerActions'

// version must match with npm package version
const BINARY_URL = 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/'

let pyodide: PyodideInterface | null = null
let inputs: Record<string, any> = {}
const stdBuffer: string[] = []

onmessage = ({ data }: MessageEvent<Action>) => {
	if (data.type === 'RUN_CODE') {
		runCode(data.payload)
	}

	if (data.type === 'SET_INPUTS') {
		inputs = data.payload
	}
}

function mapSetToArray(set: Set<any>): any[] {
	const newArray = Array.from(set)
	return newArray.map((i: any) => (i instanceof Set ? mapSetToArray(i) : i))
}

function toInseri(name: string, data: PyProxy | any) {
	let convertedData = data

	try {
		if (pyodide?.isPyProxy(data)) {
			convertedData = data.toJs({
				dict_converter: Object.fromEntries,
			})
			data.destroy()
		}

		if (convertedData instanceof Set) {
			convertedData = mapSetToArray(convertedData)
		}

		if (pyodide?.isPyProxy(convertedData)) {
			stdBuffer.push('not JSON serializable')
		} else {
			postMessage({ type: 'SET_OUTPUT', key: name, payload: convertedData })
		}
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'unknown type conversion error ocurred'
		stdBuffer.push(msg)
	}
}

async function init() {
	pyodide = await loadPyodide({
		indexURL: BINARY_URL,
		stdout: (msg) => stdBuffer.push(msg),
		stderr: (msg) => stdBuffer.push(msg),
	})
	postMessage({ type: 'STATUS', payload: 'ready' })

	pyodide.registerJsModule('inseri', { to_inseri: toInseri })
}

async function runCode(code: string) {
	try {
		if (pyodide) {
			stdBuffer.splice(0, stdBuffer.length)
			postMessage({ type: 'STATUS', payload: 'in-progress' })

			await pyodide.loadPackagesFromImports(code)
			await pyodide.runPythonAsync(code, { globals: pyodide.toPy(inputs) })
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
