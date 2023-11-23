import { Option } from './option'

interface ValueWrapper<T = any> {
	readonly type: 'wrapper'

	readonly contentType: string
	readonly value: T
}

interface None {
	readonly type: 'none'
}

export type ValueInfo<T = any> = ValueWrapper<T> | None

export interface Nucleus<T> {
	readonly contentType: string
	readonly value: T
}

export interface Atom<T = any> {
	readonly content: Option<Nucleus<T>>
	readonly description: string
}

export interface BlockInfo {
	readonly blockType: string
	readonly blockName: string
	readonly clientId: string
	readonly state: 'ready' | 'pending' | 'failed'
	readonly atoms: Record<string, Atom>
}

export type Root = Record<string, BlockInfo>

interface UpdateBlockAction {
	type: 'update-block-slice'
	payload: {
		blockId: string
		blockName: string
		blockType: string
		clientId: string
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
		content: Option<any>
	}
}

export type Action = UpdateBlockAction | AddValueInfosAction | UpdateValueInfosAction | RemoveValueInfosAction | RemoveAllValueInfosAction | SetValueAction
