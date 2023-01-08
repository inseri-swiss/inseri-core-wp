import { updatePartially } from '../../utils'
import { immer } from 'zustand/middleware/immer'
import { Attributes } from './index'
import { getAllMedia, Media } from '../../ApiServer'

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

	actions: {
		updateState: (modifier: Partial<GlobalState>) => void
		loadMedias: () => void
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
		selectedFileId: null,

		actions: {
			updateState: (modifier: RecursivePartial<GlobalState>) =>
				set((state) => {
					updatePartially(state, modifier)
				}),

			loadMedias: async () => {
				const ids = get().fileIds
				const [_, medias] = await getAllMedia(ids)

				if (medias) {
					set((state) => {
						state.files = medias.map(transformToFile)
					})
				}
			},
		},
	}))
}
