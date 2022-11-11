import { useState } from '@wordpress/element'
import { CodeEditor } from '../../components'

export function Component({ attributes }: { attributes: any }) {
	const { contentType, description, value, status } = InseriCore.useInseriStore(attributes?.source)
	const [url, setUrl] = useState('')

	if (contentType.includes('image/') && !url && value) {
		setUrl(URL.createObjectURL(value))
	}

	return (
		<div>
			<strong>{description}</strong>
			<p>
				Content Type: <strong>{contentType} </strong>
			</p>
			<p>
				Current status: <strong>{status}</strong>
			</p>

			{contentType.includes('text/') ? (
				<p>
					Value <br />
					<strong>{value}</strong>
				</p>
			) : contentType.includes('application/json') ? (
				<div>
					Value <br />
					<CodeEditor type={'json'} value={value ? JSON.stringify(value) : ''} />
				</div>
			) : contentType.includes('image/') && url ? (
				<div>
					Value <br />
					<img src={url} />
				</div>
			) : (
				<div>
					Value Size
					<br />
					<strong>{(value as Blob)?.size}</strong>
				</div>
			)}
		</div>
	)
}
