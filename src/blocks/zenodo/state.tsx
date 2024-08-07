import type { Draft } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { guessContentTypeByExtension, updatePartially } from '../../utils'
import { Attributes } from './index'
import { __ } from '@wordpress/i18n'
import { ZenodoRecord, callMediaFile, getZenodoRecord } from '../../ApiServer'

const ZENODO_PREFIX = '10.5281/zenodo.'

export interface GlobalState extends Attributes {
	[i: string]: any

	isWizardMode: boolean
	isWizardLoading: boolean
	hasWizardError: boolean
	doiError: string
	record: ZenodoRecord | undefined
	fileContent: any
	isLoading: boolean
	hasError: boolean
	mime: string

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		setDoi: (doi: string) => Promise<void>
		chooseFile: (url: string | null) => Promise<void>
		loadFile: () => Promise<void>
	}
}

type Set = (nextStateOrUpdater: (state: Draft<GlobalState>) => void, shouldReplace?: boolean | undefined) => void

export const storeCreator = (initalState: Attributes) => {
	let doiCallback: any

	const loadZenodoRecord = async (set: Set, doi: string, isInitiated: boolean = false) => {
		if (doi.trim() && doi.startsWith(ZENODO_PREFIX)) {
			set((state) => {
				state.isWizardLoading = true
				state.hasWizardError = false
				state.record = undefined
			})

			const recordId = doi.split('zenodo.')[1]
			const [errMsg, data] = await getZenodoRecord(recordId)

			if (errMsg) {
				set((state) => {
					state.hasWizardError = true
				})
			}

			if (data) {
				set((state) => {
					state.record = data

					if (!isInitiated) {
						const downloadLinks = data.files.map((f) => f.key)
						state.files = downloadLinks

						if (downloadLinks.length === 1) {
							state.selectedFile = downloadLinks[0]
						}
					}
				})
			}

			set((state) => {
				state.isWizardLoading = false
			})
		}
	}

	const innerLoadFile = async (set: Set, key: string, record: ZenodoRecord) => {
		const fileSplitted = key.split('.')
		const fileExt = fileSplitted[fileSplitted.length - 1].split('/')[0]
		const contentType = guessContentTypeByExtension(fileExt) ?? ''

		set((state) => {
			state.isLoading = true
			state.mime = contentType
		})

		const url = record.files.find((f) => f.key === key)?.links.self ?? ''
		const [err, data] = await callMediaFile(url, contentType)

		set((state) => {
			if (data) {
				state.fileContent = data
			}

			if (err) {
				state.hasError = true
			}

			state.isLoading = false
		})
	}

	return immer<GlobalState>((set, get) => ({
		...initalState,
		isWizardMode: initalState.files.length === 0,
		isWizardLoading: false,
		hasWizardError: false,
		doiError: '',
		record: undefined,
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
				const preparedDoi = doi.trim()

				set((state) => {
					state.doi = doi
				})

				clearTimeout(doiCallback)
				doiCallback = setTimeout(async () => {
					set((state) => {
						if (preparedDoi && !preparedDoi.startsWith(ZENODO_PREFIX)) {
							state.doiError = __('It is not an Zenodo DOI.', 'inseri-core')
						} else {
							state.doiError = ''
						}
					})

					loadZenodoRecord(set, preparedDoi)
				}, 500)
			},

			chooseFile: async (key: string | null) => {
				set((state) => {
					state.selectedFile = key
					state.hasError = false
				})

				if (!key) {
					set((state) => {
						state.fileContent = null
					})
				}

				if (key) {
					innerLoadFile(set, key, get().record!)
				}
			},

			loadFile: async () => {
				if (!get().record) {
					await loadZenodoRecord(set, get().doi.trim(), true)
				}

				const { selectedFile, record } = get()

				if (selectedFile) {
					innerLoadFile(set, selectedFile, record!)
				}
			},
		},
	}))
}
