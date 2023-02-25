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

export interface SetOutput {
	type: 'SET_OUTPUT'
	key: string
	payload: any
}

export interface SetStatus {
	type: 'STATUS'
	payload: 'initial' | 'ready' | 'in-progress'
}

export type Action = RunCode | SetStdStream | SetInputs | SetOutput | SetStatus
