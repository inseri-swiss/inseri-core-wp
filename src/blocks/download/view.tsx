import { useWatch } from '@inseri/lighthouse'
import { useEffect } from '@wordpress/element'
import stringify from 'json-stable-stringify'
import { Button, useGlobalState } from '../../components'
import { CONTENT_TYPE_TO_EXT } from '../../utils'
import { GlobalState } from './state'

export default function View() {
	const { input, label, fileName, extension, downloadLink } = useGlobalState((state: GlobalState) => state)
	const { updateDownloadObject, updateState } = useGlobalState((state: GlobalState) => state.actions)

	const { value, status, contentType } = useWatch(input)
	const isNotReady = status !== 'ready' || !downloadLink

	useEffect(() => {
		let ext = ''
		const found = CONTENT_TYPE_TO_EXT.find((c) => contentType.includes(c.value))
		if (found) {
			ext = found.ext
		}

		updateState({ extension: ext })
	}, [contentType])

	useEffect(() => {
		let processedValue = value

		if (status === 'ready') {
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
	}, [value])

	const fullFileName = fileName + (extension ? '.' + extension : '')

	return (
		<Button style={{ color: '#fff' }} component="a" href={downloadLink} download={fullFileName} disabled={isNotReady}>
			{label}
		</Button>
	)
}
