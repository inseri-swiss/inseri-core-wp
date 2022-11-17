import { useEffect, useState } from '@wordpress/element'
import { Provider } from '../../blockUtils'
import { CodeEditor, Stack, Box } from '../../components'

export function Component({ attributes }: { attributes: any }) {
	const [content, setContent] = useState('')
	const val = InseriCore.useInseriStore(attributes.source)

	useEffect(() => {
		if (val.status === 'ready') {
			if (typeof val.value === 'object') {
				setContent(JSON.stringify(val.value))
			}
			if (typeof val.value === 'string') {
				setContent(val.value)
			}
		}
	}, [val.status, val.value])
	return (
		<Provider>
			<Stack style={{ padding: '8px', border: '2px solid ' + attributes.color }}>
				<Box p="md">
					Plaintext
					<CodeEditor type="text" value={content} />
				</Box>
			</Stack>
		</Provider>
	)
}
