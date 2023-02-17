export interface RunCode {
	type: 'RUN_CODE'
	payload: string
}

export interface SetStdOut {
	type: 'SET_STD_OUT'
	payload: string
}

export interface SetStdErr {
	type: 'SET_STD_ERR'
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

export type Action = RunCode | SetStdOut | SetStdErr | SetInputs | SetOutput | SetStatus
