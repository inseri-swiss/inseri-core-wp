import { Datasource } from '../ApiServer'
import { immer } from 'zustand/middleware/immer'
import { ParamItem } from './ParamsTable'
import { createParamItem } from './DetailView'
import { updatePartially } from '../utils'

interface AdminAttributes {
	mode: 'create' | 'edit' | 'read' | 'none'
	openAccordionItems: string[]
	webApiId: number | null
	item: Datasource | null

	heading: {
		pageError: string
		isLoading: boolean

		name: string
		webApiType: string
		contentType: string
		isContentTypeLock: boolean
	}

	parameters: {
		method: string
		url: string
		urlError: string

		queryParams: ParamItem[]
		headerParams: ParamItem[]
		bodyType: string
		textBody: string
		paramsBody: ParamItem[]
		bodyError: string
	}

	response: {
		status: string
		headerParams: ParamItem[]
		body: any
		bodyType: string
	}
}

export interface AdminState extends AdminAttributes {
	actions: {
		updateState: (modifier: RecursivePartial<AdminState>) => void
	}
}

export const initialState: AdminAttributes = {
	mode: 'none',
	openAccordionItems: ['request'],
	webApiId: null,
	item: null,

	heading: {
		pageError: '',
		isLoading: false,

		name: '',
		webApiType: 'general',
		contentType: '',
		isContentTypeLock: false,
	},

	parameters: {
		method: 'GET',
		url: '',
		urlError: '',

		queryParams: [createParamItem()],
		headerParams: [createParamItem()],
		bodyType: 'none',
		textBody: '',
		paramsBody: [createParamItem()],
		bodyError: '',
	},
	response: {
		status: '',
		headerParams: [createParamItem()],
		body: '',
		bodyType: '',
	},
}

export const storeCreator = (initalState: AdminAttributes) => {
	return immer<AdminState>((set) => ({
		...initalState,

		actions: {
			updateState: (modifier: RecursivePartial<AdminAttributes>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),
		},
	}))
}
