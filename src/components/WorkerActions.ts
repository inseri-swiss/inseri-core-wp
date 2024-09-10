export interface RunCode {
	type: 'RUN_CODE'
	payload: string
}
export interface SetStdStream {
	type: 'SET_STD_STREAM'
	payload: string
}
export interface SetInputs {
	type: 'SET_INPUTS'
	payload: Record<string, any>
}
export interface SetOutputs {
	type: 'SET_OUTPUTS'
	payload: string[]
}
export interface SetResults {
	type: 'SET_RESULTS'
	payload: Record<string, any>
	files?: Record<string, [string, any]>
}
export interface SetStatus {
	type: 'STATUS'
	payload: 'initial' | 'ready' | 'in-progress'
}

export type Action = RunCode | SetStdStream | SetInputs | SetOutputs | SetStatus | SetResults
