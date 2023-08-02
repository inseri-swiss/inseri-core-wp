import { useWatch } from '@inseri/lighthouse-next'
import stringify from 'json-stable-stringify'
import { useDeepCompareEffect } from 'react-use'
import { Button, useGlobalState } from '../../components'
import { CONTENT_TYPE_TO_EXT } from '../../utils'
import { GlobalState } from './state'

export default function View() {
	const { inputKey, label, fileName, extension, downloadLink } = useGlobalState((state: GlobalState) => state)
	const { updateDownloadObject, updateState } = useGlobalState((state: GlobalState) => state.actions)

	const valueWrapper = useWatch(inputKey, () => {
		updateState({ inputKey: '', isWizardMode: true })
	})
	const isNotReady = valueWrapper.type === 'none' || !downloadLink

	useDeepCompareEffect(() => {
		if (valueWrapper.type === 'wrapper') {
			const { value, contentType } = valueWrapper

			const found = CONTENT_TYPE_TO_EXT.find((c) => contentType.includes(c.value))
			const ext = found ? found.ext : ''
			updateState({ extension: ext })

			let processedValue = value

			if (contentType.includes('json')) {
				processedValue = stringify(processedValue)
			}

			if (typeof processedValue === 'string') {
				const mimeType = contentType.split(';')[0]
				processedValue = new Blob([processedValue], { type: mimeType })
			}

			if (typeof processedValue === 'object' && processedValue instanceof Blob) {
				updateDownloadObject(processedValue)
			}
		}
	}, [valueWrapper])

	const fullFileName = fileName + (extension ? '.' + extension : '')

	return (
		<Button style={{ color: '#fff' }} component="a" href={downloadLink} download={fullFileName} disabled={isNotReady}>
			{label}
		</Button>
	)
}
