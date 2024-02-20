import { usePublish, useWatch } from '@inseri/lighthouse'
import { useState } from '@wordpress/element'
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table'
import { Box, useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	const { inputColumns, inputData, options } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const [columns, setColumns] = useState([])
	const [data, setData] = useState([])

	const [publishRow] = usePublish('row', 'selected row')
	const [publishCell] = usePublish('cell', 'selected cell')

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
		...options,

		mantineTableBodyRowProps: ({ row }) => ({
			onClick: (_event) => publishRow(row.original, 'application/json'),
			sx: { cursor: 'pointer' },
		}),
		mantineTableBodyCellProps: ({ cell, row }) => ({
			onDoubleClick: (_event) => {
				const accessorKey = cell.column.columnDef.accessorKey ?? cell.column.id
				const cellContent = accessorKey.split('.').reduce((a, b) => a[b], row.original as any)
				publishCell({ accessorKey, row: row.original, cell: cellContent }, 'application/json')
			},
		}),
	})

	return (
		<Box>
			<MantineReactTable table={table} />
		</Box>
	)
}
