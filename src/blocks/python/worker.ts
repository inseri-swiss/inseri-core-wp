import { loadPyodide, PyodideInterface, PyProxy } from 'pyodide'
import { Action } from './WorkerActions'

// version must match with npm package version
const BINARY_URL = 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/'

let pyodide: PyodideInterface | null = null
let inputs: Record<string, any> = {}

onmessage = ({ data }: MessageEvent<Action>) => {
	if (data.type === 'RUN_CODE') {
		runCode(data.payload)
	}

	if (data.type === 'SET_INPUTS') {
		inputs = data.payload
	}
}

function toInseri(name: string, data: PyProxy | any) {
	let convertedData = data

	if (pyodide?.isPyProxy(data)) {
		convertedData = data.toJs()
		data.destroy()
	}

	if (convertedData instanceof Map) {
		convertedData = Object.fromEntries(convertedData)
	}

	if (convertedData instanceof Set) {
		convertedData = Array.from(convertedData)
	}

	if (pyodide?.isPyProxy(convertedData)) {
		postMessage({ type: 'SET_STD_ERR', stderr: 'not JSON-serializable' })
	} else {
		postMessage({ type: 'SET_OUTPUT', key: name, payload: convertedData })
	}
}

async function init() {
	pyodide = await loadPyodide({
		indexURL: BINARY_URL,
		stdout: (msg) => postMessage({ type: 'SET_STD_OUT', payload: msg }),
		stderr: (msg) => postMessage({ type: 'SET_STD_ERR', payload: msg }),
	})
	postMessage({ type: 'STATUS', payload: 'ready' })

	pyodide.registerJsModule('inseri', { to_inseri: toInseri })
}

async function runCode(code: string) {
	try {
		if (pyodide) {
			await pyodide.loadPackagesFromImports(code)

			postMessage({ type: 'STATUS', payload: 'in-progress' })
			await pyodide.runPythonAsync(code, { globals: pyodide.toPy(inputs) })
		}
	} catch (error) {
		if (error instanceof Error) {
			postMessage({ type: 'SET_STD_ERR', payload: error.message })
		} else {
			postMessage({ type: 'SET_STD_ERR', payload: 'unknown error ocurred' })
		}
	} finally {
		postMessage({ type: 'STATUS', payload: 'ready' })
	}
}

init()
