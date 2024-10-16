import { immer } from 'zustand/middleware/immer'
import { callMediaFile, getAllMedia, Media } from '../../ApiServer'
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
	selectedFileId: string | null

	fileContent: any
	isLoading: boolean
	hasError: boolean
	mime: string

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		chooseFile: (id: string | null) => Promise<void>
	}
}

const transformToFile = (file: Media): File => {
	const sizes = file.media_details.sizes
	let thumbnail = '/wp-includes/images/media/default.png'

	if (sizes.thumbnail?.source_url) {
		thumbnail = sizes.thumbnail.source_url
	} else if (sizes.medium?.source_url) {
		thumbnail = sizes.medium.source_url
	} else if (sizes.full?.source_url) {
		thumbnail = sizes.full.source_url
	} else if (file.mime_type.startsWith('image')) {
		thumbnail = file.source_url
	}

	return { value: String(file.id), label: file.title.rendered, url: file.source_url, mime: file.mime_type, thumbnail }
}

export const storeCreator = (initalState: Attributes) => {
	return immer<GlobalState>((set, get) => ({
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

			chooseFile: async (id: string | null) => {
				set((state) => {
					state.selectedFileId = id
					state.hasError = false

					if (!id) {
						state.fileContent = null
					}
				})

				const retrievedState = get()
				const { fileIds } = retrievedState
				let { files } = retrievedState

				if (files.length === 0) {
					const [err, medias] = await getAllMedia(fileIds)

					if (medias) {
						files = medias.map(transformToFile)
						set((state) => {
							state.files = files
						})
					}
					if (err) {
						set((state) => {
							state.hasError = true
						})
					}
				}

				const file = files.find((f) => f.value === id)
				if (file) {
					set((state) => {
						state.isLoading = true
						state.mime = file.mime
					})

					const [err, data] = await callMediaFile(file.url, file.mime)

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
			},
		},
	}))
}
