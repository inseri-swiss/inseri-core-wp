import { usePublish, useWatch } from '@inseri/lighthouse'
import { useState } from '@wordpress/element'
import { MRT_ColumnFiltersState, MRT_SortingState, MantineReactTable, useMantineReactTable } from 'mantine-react-table'
import { useDeepCompareEffect } from 'react-use'
import { Box, useGlobalState } from '../../components'
import { GlobalState } from './state'
import { isValueValid } from './utils'

export default function View() {
	const { inputColumns, inputData, options } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const [columns, setColumns] = useState([])
	const [data, setData] = useState([])

	const [publishRow] = usePublish('row', 'selected row')
	const [publishCell] = usePublish('cell', 'selected cell')
	const [publishTable] = usePublish('table', 'filtered and sorted table')

	const [sorting, setSorting] = useState<MRT_SortingState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])

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
					preparedData = isValueValid(preparedData) ? preparedData : []
					setColumns(preparedData)
				}
			},
		}
	)

	const table = useMantineReactTable<any>({
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

		state: {
			sorting,
			globalFilter,
			columnFilters,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onColumnFiltersChange: setColumnFilters,
	})

	useDeepCompareEffect(() => {
		const tableRows = table.getRowModel().rows.map((r) => r.original)
		publishTable(tableRows, 'application/json')
	}, [sorting, globalFilter, columnFilters])

	return (
		<Box>
			<MantineReactTable table={table} />
		</Box>
	)
}
