import { immer } from 'zustand/middleware/immer'
import { updatePartially } from '../../utils'
import { Attributes } from './index'

interface File {
	value: string
	label: string
	url: string
	mime: string
	thumbnail: string
}

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	files: File[]

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
	}
}

export const storeCreator = (initalState: Attributes) => {
	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: initalState.fileIds.length === 0,
		files: [],
		fileContent: null,
		isLoading: false,
		hasError: false,
		mime: '',

		actions: {
			updateState: (modifier: RecursivePartial<GlobalState>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),
		},
	}))
}
