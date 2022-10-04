import { IconX } from '@tabler/icons'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { ActionIcon, Checkbox, createStyles, Table, TextInput } from '../components'

const useStyles = createStyles((theme, _params, getRef) => ({
	table: {
		[`& td:first-of-type`]: {
			width: '50px',
			paddingLeft: theme.spacing.md,
		},

		[`& td:nth-of-type(3)`]: {
			width: '60%',
		},

		[`& th:nth-of-type(2)`]: {
			paddingLeft: theme.spacing.md,
		},
		[`& th:nth-of-type(3)`]: {
			paddingLeft: theme.spacing.md,
		},

		[`& td:last-of-type`]: {
			width: '60px',
			paddingRight: theme.spacing.md,
		},
	},

	paramInput: {
		ref: getRef('param-input'),
	},
	paramWrapper: {
		[`& > .${getRef('param-input')}`]: {
			border: 'none',
			'&:focus': {
				border: '1px solid #8c8f94',
				boxShadow: 'none',
			},
		},
	},
}))

interface RowItem {
	isChecked: boolean
	key: string
	value: string
}

export interface Params {
	[key: string]: string
}

interface Props {
	onChange: (obj: Params) => void
}

export function ParamsTable({ onChange }: Props) {
	const [rowData, setRowData] = useState<RowItem[]>([{ isChecked: true, key: '', value: '' }])

	const { table, paramInput, paramWrapper } = useStyles().classes

	useEffect(() => {
		const paramsObject: Params = rowData
			.filter((i) => i.isChecked)
			.filter((i) => i.key || i.value)
			.reduce((acc, i) => ({ ...acc, [i.key]: i.value }), {})

		onChange(paramsObject)
	}, [rowData])

	const updateParams = ({ key, value, isChecked }: { key?: string; value?: string; isChecked?: boolean }, index: number) => {
		let tail = null
		if (index === rowData.length - 1) {
			tail = { isChecked: true, key: '', value: '' }
		}

		const item = rowData[index]
		const updatedItem = {
			key: key ?? item.key,
			value: value ?? item.value,
			isChecked: isChecked ?? item.isChecked,
		}

		const updatedData = [...rowData.slice(0, index), updatedItem, ...rowData.slice(index + 1), tail].filter(Boolean) as RowItem[]

		setRowData(updatedData)
	}

	const removeParam = (index: number) => () => {
		const updatedData = [...rowData]
		updatedData.splice(index, 1)
		setRowData(updatedData)
	}

	const isNotLastIndex = (index: number) => index !== rowData.length - 1

	return (
		<Table className={table}>
			<thead>
				<tr>
					<th></th>
					<th>{__('Key', 'inseri-core')}</th>
					<th>{__('Value', 'inseri-core')}</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{rowData.map(({ key, value, isChecked }, index) => (
					<tr key={index}>
						<td>
							{isNotLastIndex(index) && (
								<Checkbox color="gray" checked={isChecked} onChange={(event) => updateParams({ isChecked: event.target.checked }, index)} />
							)}
						</td>
						<td>
							<TextInput
								classNames={{ input: paramInput, wrapper: paramWrapper }}
								value={key}
								onChange={(event) => updateParams({ key: event.target.value }, index)}
								placeholder="key"
							/>
						</td>
						<td>
							<TextInput
								classNames={{ input: paramInput, wrapper: paramWrapper }}
								value={value}
								onChange={(event) => updateParams({ value: event.target.value }, index)}
								placeholder="value"
							/>
						</td>
						<td>
							{isNotLastIndex(index) && (
								<ActionIcon onClick={removeParam(index)}>
									<IconX size={16} />
								</ActionIcon>
							)}
						</td>
					</tr>
				))}
			</tbody>
		</Table>
	)
}
