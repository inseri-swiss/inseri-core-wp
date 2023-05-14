import { useDispatch, useWatch } from '@inseri/lighthouse'
import { Box, Select } from '../../components'
import { Attributes } from './index'

export default function View(props: { attributes: Readonly<Attributes> }) {
	const { attributes } = props
	const { value, contentType, status } = useWatch(attributes.input)
	const dispatch = useDispatch(attributes.output)

	let data = []
	if (contentType.match('/json') && status === 'ready') {
		data = value
	}

	return (
		<Box p="md">
			<Select
				label={attributes.label}
				data={data}
				onChange={(item) => dispatch({ status: 'ready', value: item })}
				searchable={attributes.searchable}
				clearable={attributes.clearable}
			/>
		</Box>
	)
}
