import { Action } from '../../components'

let inputs: Record<string, any> = {}
let outputs: string[] = []
const stdBuffer: string[] = []

watchConsole()
postMessage({ type: 'STATUS', payload: 'ready' })

onmessage = ({ data }: MessageEvent<Action>) => {
	if (data.type === 'RUN_CODE') {
		runCode(data.payload)
	}

	if (data.type === 'SET_INPUTS') {
		inputs = data.payload
	}

	if (data.type === 'SET_OUTPUTS') {
		outputs = data.payload
	}
}

async function runCode(code: string) {
	try {
		stdBuffer.splice(0, stdBuffer.length)
		postMessage({ type: 'STATUS', payload: 'in-progress' })

		const initVariables = Object.keys(inputs).reduce((acc, key) => acc + `var ${key} = inputs['${key}'] ;\n`, '')
		const settingResults = 'return { ' + outputs.reduce((acc, key) => acc + ` ${key},`, '') + ' }'

		const results = Function('inputs', initVariables + code + '\n' + settingResults)(inputs)

		postMessage({ type: 'SET_RESULTS', payload: results })
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'unknown error ocurred'
		stdBuffer.push(msg)
	} finally {
		postMessage({ type: 'SET_STD_STREAM', payload: stdBuffer.filter(Boolean).join('\n') })
		postMessage({ type: 'STATUS', payload: 'ready' })
	}
}

function watchConsole() {
	const _backupConsole: any = { ...console }
	const levels = [
		'error',
		'info',
		'log',
		'trace',
		'warn',
	]
	levels.forEach((lvl) => {
		//@ts-ignore
		//eslint-disable-next-line
		console[lvl] = function (...args) {
			stdBuffer.push(...args)
			_backupConsole[lvl](...args)
		}
	})
}
