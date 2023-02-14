import { loadPyodide, PyodideInterface } from 'pyodide'

// version must match with npm package version
const BINARY_URL = 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/'

let pyodide: PyodideInterface | null = null
let inputs: Record<string, any> = {}

onmessage = ({ data }) => {
	if (typeof data.code === 'string') {
		runCode(data.code)
	}

	if (data.inputs) {
		inputs = data.inputs
	}
}

async function init() {
	pyodide = await loadPyodide({
		indexURL: BINARY_URL,
		stdout: (msg) => postMessage({ stdout: msg }),
		stderr: (msg) => postMessage({ stderr: msg }),
	})
	postMessage({ isWorkerReady: true })
}

async function runCode(code: string) {
	try {
		if (pyodide) {
			await pyodide.loadPackagesFromImports(code)

			const result = await pyodide.runPythonAsync(code, { globals: pyodide.toPy(inputs) })
			postMessage({ result })
		}
	} catch (error) {
		if (error instanceof Error) {
			postMessage({ stderr: error.message })
		} else {
			postMessage({ stderr: 'unknown error ocurred' })
		}
	}
}

init()
