interface ValueWrapper<T = any> {
	readonly type: 'wrapper'

	readonly contentType: string
	readonly value: T
}

interface None {
	readonly type: 'none'
}

export type ValueInfo<T = any> = ValueWrapper<T> | None
export type ValueInfoExtra<T = any> = ValueInfo<T> & {
	readonly description: string
}

export interface BlockInfo {
	readonly blockType: string
	readonly blockName: string
	readonly state: 'ready' | 'pending' | 'failed'
	readonly values: Record<string, ValueInfoExtra>
}

export type Root = Record<string, BlockInfo>

interface UpdateBlockAction {
	type: 'update-block-slice'
	payload: {
		blockId: string
		blockName: string
		blockType: string
	}
}
interface AddValueInfosAction {
	type: 'add-value-infos'
	payload: {
		blockId: string
		keys: string[]
		descriptions: string[]
	}
}
interface UpdateValueInfosAction {
	type: 'update-value-infos'
	payload: {
		blockId: string
		keys: string[]
		descriptions: string[]
	}
}
interface RemoveValueInfosAction {
	type: 'remove-value-infos'
	payload: {
		blockId: string
		keys: string[]
	}
}
interface RemoveAllValueInfosAction {
	type: 'remove-all-value-infos'
	payload: {
		blockId: string
	}
}

interface SetValueAction {
	type: 'set-value'
	payload: {
		blockId: string
		key: string
		contentType: string
		value: any
	}
}
interface SetEmptyAction {
	type: 'set-empty'
	payload: {
		blockId: string
		key: string
	}
}

export type Action =
	| UpdateBlockAction
	| AddValueInfosAction
	| UpdateValueInfosAction
	| RemoveValueInfosAction
	| RemoveAllValueInfosAction
	| SetValueAction
	| SetEmptyAction
