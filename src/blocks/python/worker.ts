import { expose } from 'comlink'
import { loadPyodide, PyodideInterface } from 'pyodide'

importScripts('https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js')
export interface API {
	isReady: () => boolean
	inputs: any[]
	runCode: (code: string) => Promise<any>
}

let pyodide: PyodideInterface | null = null

async function init() {
	pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.22.1/full/' })
}

init()

const root = {
	inputs: [],
	isReady: () => !!pyodide,
	runCode: async (code: string) => {
		if (pyodide) {
			const result = await pyodide.runPythonAsync(code)
			return result
		}
	},
}

expose(root)
