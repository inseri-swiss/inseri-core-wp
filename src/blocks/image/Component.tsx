import { useEffect, useState } from '@wordpress/element'
import { Provider } from '../../blockUtils'
import { Stack, Box } from '../../components'

export function Component({ attributes }: { attributes: any }) {
	const { value, status } = InseriCore.useInseriStore(attributes?.source)
	const [url, setUrl] = useState('')

	useEffect(() => {
		if (status === 'ready' && value) {
			if (typeof value === 'object') {
				setUrl(URL.createObjectURL(value))
			}
			if (typeof value === 'string') {
				setUrl(value)
			}
		}
	}, [value, status])

	return (
		<Provider>
			<Stack spacing={0}>
				<Box p="md">{url ? <img src={url} width="100%" /> : 'empty'}</Box>
			</Stack>
		</Provider>
	)
}
