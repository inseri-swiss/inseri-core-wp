import { useWatch } from '@inseri/lighthouse'
import { useState } from '@wordpress/element'
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table'
import { Box, useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	const { inputColumns, inputData } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const [columns, setColumns] = useState([])
	const [data, setData] = useState([])

	useWatch(
		{ inputColumns, inputData },
		{
			onBlockRemoved: (name) => updateState({ [name]: '', isWizardMode: true }),
			onNone: (key) => {
				if (key === 'inputData') {
					setData([])
				}
				if (key === 'inputColumns') {
					setColumns([])
				}
			},
			onSome: (nucleus, key) => {
				let preparedData = nucleus.value ?? []

				if (!nucleus.contentType.includes('application/json')) {
					preparedData = []
				}

				if (key === 'inputData') {
					setData(preparedData)
				}
				if (key === 'inputColumns') {
					setColumns(preparedData)
				}
			},
		}
	)

	const table = useMantineReactTable({
		columns,
		data,
	})

	return (
		<Box>
			<MantineReactTable table={table} />
		</Box>
	)
}
