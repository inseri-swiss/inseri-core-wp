import { useEffect } from '@wordpress/element'
import { Provider } from '../../blockUtils'
import { CodeEditor, Stack, Box } from '../../components'

export function Component({ attributes }: { attributes: any }) {
	const { value, status } = InseriCore.useInseriStore(attributes?.source)
	const dispatch = InseriCore.createDispatch(attributes.handle, 'result')

	useEffect(() => {
		const fun = eval(attributes.code)
		if (value && status === 'ready') {
			const res = fun(value)
			dispatch({ value: res, status: 'ready' })
		}
	}, [status, value])

	return (
		<Provider>
			<Stack style={{ padding: '8px', border: '2px solid ' + attributes.color }}>
				<Box>
					Transform
					<CodeEditor type="javascript" value={attributes.code} />
				</Box>
			</Stack>
		</Provider>
	)
}
