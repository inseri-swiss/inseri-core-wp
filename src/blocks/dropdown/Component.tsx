import { useEffect, useState } from '@wordpress/element'
import { Provider } from '../../blockUtils'
import { Select, Stack, Box } from '../../components'

export function Component({ attributes }: { attributes: any }) {
	const { value, status } = InseriCore.useInseriStore(attributes?.source)
	const [dropdownOptions, setDropdownOptions] = useState([])

	useEffect(() => {
		if (status === 'ready') {
			setDropdownOptions(value)
		}
	}, [value, status])

	const dispatch = InseriCore.createDispatch(attributes.handle, 'selected')

	const onDropdownChange = (picked: string | null) => {
		if (picked) {
			dispatch({ value: picked, status: 'ready' })
		}
	}

	return (
		<Provider>
			<Stack style={{ border: '2px solid ' + attributes.color }} spacing={0}>
				<Box p="md">
					Choose one
					<Select data={dropdownOptions} onChange={onDropdownChange} />
				</Box>
			</Stack>
		</Provider>
	)
}
