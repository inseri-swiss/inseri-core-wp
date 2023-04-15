import { immer } from 'zustand/middleware/immer'
import { updatePartially } from '../../utils'
import { Attributes } from './index'
import { __ } from '@wordpress/i18n'
import { ZenodoRecord, getZenodoRecord } from '../../ApiServer'

const ZENODO_PREFIX = '10.5281/zenodo.'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	doiError: string
	record: ZenodoRecord | undefined
	files: any[]
	fileContent: any
	isLoading: boolean
	hasError: boolean
	mime: string

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		setDoi: (doi: string) => Promise<void>
	}
}

export const storeCreator = (initalState: Attributes) => {
	let doiCallback: any = undefined

	return immer<GlobalState>((set) => ({
		...initalState,
		isWizardMode: initalState.fileIds.length === 0,
		doiError: '',
		record: undefined,
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

			setDoi: async (doi: string) => {
				set((state) => {
					state.doi = doi
				})

				clearTimeout(doiCallback)
				doiCallback = setTimeout(async () => {
					const isNotValidDoi = doi && !doi.startsWith(ZENODO_PREFIX)

					set((state) => {
						if (isNotValidDoi) {
							state.doiError = __('It is not an Zenodo DOI.', 'inseri-core')
						} else {
							state.doiError = ''
						}
					})

					if (doi.trim() && !isNotValidDoi) {
						set((state) => {
							state.isLoading = true
							state.hasError = false
							state.record = undefined
						})

						const recordId = doi.split('zenodo.')[1]
						const [errMsg, data] = await getZenodoRecord(recordId)

						if (errMsg) {
							set((state) => {
								state.hasError = true
							})
						}

						if (data) {
							set((state) => {
								state.record = data
							})
						}

						set((state) => {
							state.isLoading = false
						})
					}
				}, 500)
			},
		},
	}))
}
