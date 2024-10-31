import { PyodideInterface } from 'pyodide'
import { Action } from '../../components'
import { createFileRecord } from '../../workerUtils'

// version must match with npm package version
const BINARY_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.3/full/'

importScripts(BINARY_URL + 'pyodide.js')
declare function loadPyodide(opt: any): Promise<PyodideInterface>

let pyodide: PyodideInterface | null = null
let inputs: Record<string, any> = {}
let outputs: string[] = []
const stdBuffer: string[] = []

const WORK_DIR = '/home/pyodide/'
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

		if (convertedData instanceof Uint8Array) {
			convertedData = new Blob([convertedData])
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
		stdout: (msg: string) => stdBuffer.push(msg),
		stderr: (msg: string) => stdBuffer.push(msg),
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

			const nodes = (await pyodide.FS.lookupPath(WORK_DIR)).node.contents ?? {}
			const files = Object.values(nodes).filter((f: any) => pyodide?.FS.isFile(f.mode))
			const fileRecord = await createFileRecord(files, WORK_DIR, pyodide)

			postMessage({ type: 'SET_RESULTS', payload: results, files: fileRecord })
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
