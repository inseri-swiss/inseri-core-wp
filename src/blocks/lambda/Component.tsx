import { useEffect } from '@wordpress/element'
import { Provider } from '../../blockUtils'
import { CodeEditor, Stack, Box } from '../../components'

export function Component({ attributes }: { attributes: any }) {
	const val1 = InseriCore.useInseriStore(attributes.source)
	const val2 = InseriCore.useInseriStore(attributes.source2)
	const dispatch = InseriCore.createDispatch(attributes.handle, 'result')

	useEffect(() => {
		if (!attributes.source && !attributes.source2) {
			const fun = eval(attributes.code)
			dispatch({ value: fun(), status: 'ready' })
		}
	}, [])

	useEffect(() => {
		const fun = eval(attributes.code)

		if (val1.value && val1.status === 'ready' && val2.value && val2.status === 'ready') {
			const res = fun(val1.value, val2.value)
			dispatch({ value: res, status: 'ready' })
		} else if (val1.value && val1.status === 'ready') {
			const res = fun(val1.value)
			dispatch({ value: res, status: 'ready' })
		}
	}, [val1.status, val1.value, val2.status, val2.value])

	return (
		<Provider>
			<Stack style={{ border: '2px solid ' + attributes.color }}>
				<Box p="md">
					Transform
					<CodeEditor type="javascript" value={attributes.code} />
				</Box>
			</Stack>
		</Provider>
	)
}
