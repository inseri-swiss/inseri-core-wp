import { loadPyodide, PyodideInterface, PyProxy } from 'pyodide'
import { Action } from './WorkerActions'

// version must match with npm package version
const BINARY_URL = 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/'

let pyodide: PyodideInterface | null = null
let inputs: Record<string, any> = {}
const stdoutBuffer: string[] = []
const stderrBuffer: string[] = []

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
			stderrBuffer.push('not JSON serializable')
		} else {
			postMessage({ type: 'SET_OUTPUT', key: name, payload: convertedData })
		}
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'unknown type conversion error ocurred'
		stderrBuffer.push(msg)
	}
}

async function init() {
	pyodide = await loadPyodide({
		indexURL: BINARY_URL,
		stdout: (msg) => stdoutBuffer.push(msg),
		stderr: (msg) => stderrBuffer.push(msg),
	})
	postMessage({ type: 'STATUS', payload: 'ready' })

	pyodide.registerJsModule('inseri', { to_inseri: toInseri })
}

async function runCode(code: string) {
	try {
		if (pyodide) {
			stdoutBuffer.splice(0, stdoutBuffer.length)
			stderrBuffer.splice(0, stderrBuffer.length)

			postMessage({ type: 'STATUS', payload: 'in-progress' })
			await pyodide.loadPackagesFromImports(code)
			await pyodide.runPythonAsync(code, { globals: pyodide.toPy(inputs) })
		}
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'unknown error ocurred'
		stderrBuffer.push(msg)
	} finally {
		postMessage({ type: 'SET_STD_OUT', payload: stdoutBuffer.filter(Boolean).join('\n') })
		postMessage({ type: 'SET_STD_ERR', payload: stderrBuffer.filter(Boolean).join('\n') })
		postMessage({ type: 'STATUS', payload: 'ready' })
	}
}

init()
