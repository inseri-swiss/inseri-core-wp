import { Nucleus, useWatch } from '@inseri/lighthouse'
import stringify from 'json-stable-stringify'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { Button } from '@mantine/core'
import { CONTENT_TYPE_TO_EXT } from '../../utils'
import { Attributes } from './index'
import { downloadLinkState, extensionState, wizardState } from './state'

export default function View(props: { attributes: Attributes; setAttributes?: (item: Partial<Attributes>) => void }) {
	const { attributes, setAttributes } = props
	const { blockId, inputKey, label, fileName, fileExt } = attributes

	const [downloadLink, setDownloadLink] = useRecoilState(downloadLinkState(blockId))
	const [extension, setExtension] = useRecoilState(extensionState(blockId))
	const setWizardMode = useSetRecoilState(wizardState(blockId))

	const isReady = useWatch(inputKey, {
		onNone: () => {
			URL.revokeObjectURL(downloadLink)
			setDownloadLink('')

			return false
		},
		onSome: ({ contentType, value }: Nucleus<any>) => {
			const found = CONTENT_TYPE_TO_EXT.find((c) => contentType.includes(c.value))
			const ext = found ? found.ext : ''
			setExtension(ext)

			let processedValue = value

			if (contentType.includes('json')) {
				processedValue = stringify(processedValue)
			}

			if (typeof processedValue === 'string') {
				const mimeType = contentType.split(';')[0]
				processedValue = new Blob([processedValue], { type: mimeType })
			}

			if (typeof processedValue === 'object' && processedValue instanceof Blob) {
				URL.revokeObjectURL(downloadLink)
				setDownloadLink(URL.createObjectURL(processedValue))
			}

			return true
		},
		onBlockRemoved: () => {
			if (setAttributes) {
				setWizardMode(true)
				setAttributes({ inputKey: '' })
			}
		},
	})

	const preparedExt = fileExt ?? extension
	const fullFileName = fileName + (preparedExt ? '.' + preparedExt : '')

	return (
		<Button style={{ color: '#fff' }} component="a" href={downloadLink} download={fullFileName} disabled={!isReady}>
			{label}
		</Button>
	)
}
