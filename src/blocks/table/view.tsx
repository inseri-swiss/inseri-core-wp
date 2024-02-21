import { usePublish, useWatch } from '@inseri/lighthouse'
import { useState } from '@wordpress/element'
import type { MRT_ColumnFiltersState as ColumnFiltersState, MRT_SortingState as SortingState } from 'mantine-react-table'
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table'
import { useDeepCompareEffect } from 'react-use'
import { Box, useGlobalState } from '../../components'
import { GlobalState } from './state'
import { isValueValid } from './utils'

export default function View() {
	const { inputColumns, inputData, options, extraOptions } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const { enableRowClick, enableCellClick, enableEditing } = extraOptions

	const [columns, setColumns] = useState([])
	const [data, setData] = useState<any[]>([])

	const [publishRow] = usePublish('row', 'selected row')
	const [publishCell] = usePublish('cell', 'selected cell')
	const [publishTable] = usePublish('table', 'filtered and sorted table')

	const [sorting, setSorting] = useState<SortingState>([])
	const [globalFilter, setGlobalFilter] = useState('')
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

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

		mantineTableBodyRowProps: enableRowClick
			? ({ row }) => ({
					onClick: (_event) => publishRow(row.original, 'application/json'),
					sx: { cursor: 'pointer' },
			  })
			: undefined,

		mantineTableBodyCellProps: enableCellClick
			? ({ cell, row }) => ({
					onDoubleClick: (_event) => {
						const accessorKey = cell.column.id
						const cellContent = accessorKey.split('.').reduce((a, b) => a[b], row.original as any)
						publishCell({ accessorKey, row: row.original, cell: cellContent }, 'application/json')
					},
					sx: { cursor: 'pointer' },
			  })
			: undefined,

		enableEditing,
		editDisplayMode: 'cell',
		mantineEditTextInputProps: enableEditing
			? ({ cell }) => ({
					onBlur: (event) => {
						const updatedRecord = { ...data[cell.row.index], [cell.column.id]: event.target.value }
						const updatedData = data.toSpliced(cell.row.index, 1, updatedRecord)
						setData(updatedData)
					},
			  })
			: undefined,

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
	}, [sorting, globalFilter, columnFilters, data])

	return (
		<Box>
			<MantineReactTable table={table} />
		</Box>
	)
}
