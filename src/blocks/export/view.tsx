import { useState } from '@wordpress/element'
import { getBlueprint, getWXR } from '../../ApiServer'
import { Button, useGlobalState, Text } from '../../components'
import { GlobalState } from './state'
import JsZip from 'jszip'

export default function View() {
	const { postId } = useGlobalState((state: GlobalState) => state)
	const [blobUrl, setBlobUrl] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false)
	const [hasError, setHasError] = useState(true)

	const load = async () => {
		setIsLoading(true)
		setHasError(false)

		const blueprint = getBlueprint()
		const wxr = getWXR(postId)

		const [blueprintErr, blueprintData] = await blueprint
		const [wxrErr, wxrData] = await wxr

		if (!blueprintErr && !wxrErr) {
			const zip = JsZip()
			zip.file('blueprint.json', blueprintData!)
			zip.file('post.xml', wxrData!)

			const resultingZip = await zip.generateAsync({ type: 'blob' })
			setBlobUrl(URL.createObjectURL(resultingZip))
		} else {
			setHasError(true)
		}
		setIsLoading(false)
	}

	return (
		<div>
			{hasError && (
				<Text color="red" size="sm">
					An error has occurred
				</Text>
			)}
			{!blobUrl ? (
				<Button onClick={load} loading={isLoading}>
					Create Archive
				</Button>
			) : (
				<Button component="a" href={blobUrl} download={'archive.zip'}>
					Download Archive
				</Button>
			)}
		</div>
	)
}
