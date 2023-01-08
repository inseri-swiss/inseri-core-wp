import type { Draft } from 'immer'
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
		loadMedias: () => Promise<void>
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

type Set = (nextStateOrUpdater: (state: Draft<GlobalState>) => void, shouldReplace?: boolean | undefined) => void

export const storeCreator = (initalState: Attributes) => {
	const loadFile = async (set: Set, file: File) => {
		set((state) => {
			state.isLoading = true
			state.mime = file.mime
		})

		const [err, data] = await callMediaFile(file.value, file.mime)

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

			loadMedias: async () => {
				const { fileIds, selectedFileId } = get()
				const [err, medias] = await getAllMedia(fileIds)

				if (medias) {
					const newFiles = medias.map(transformToFile)
					set((state) => {
						state.files = newFiles
					})

					const file = newFiles.find((f) => f.value === selectedFileId)
					if (file) {
						loadFile(set, file)
					}
				}
				if (err) {
					set((state) => {
						state.hasError = true
					})
				}
			},
			chooseFile: async (id: string | null) => {
				set((state) => {
					state.selectedFileId = id
					state.hasError = false
				})

				if (!id) {
					set((state) => {
						state.fileContent = null
					})
				}

				const file = get().files.find((f) => f.value === id)
				if (file) {
					loadFile(set, file)
				}
			},
		},
	}))
}
