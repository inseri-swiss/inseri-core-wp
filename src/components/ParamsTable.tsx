import { IconX } from '@tabler/icons-react'
import { __ } from '@wordpress/i18n'
import { ActionIcon, Checkbox, createStyles, Table, TextInput, getStylesRef } from './index'

const useStyles = createStyles((theme) => ({
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
		ref: getStylesRef('param-input'),
	},
	paramWrapper: {
		[`& > .${getStylesRef('param-input')}`]: {
			border: 'none',
			'&:focus': {
				border: '1px solid #8c8f94',
				boxShadow: 'none',
			},
		},
	},
}))

export interface ParamItem {
	isChecked: boolean
	key: string
	value: string
}

interface Props {
	items: ParamItem[]
	onItemsChange?: (params: ParamItem[]) => void
	readonly?: boolean
}

export function ParamsTable({ onItemsChange, items, readonly }: Props) {
	const { table, paramInput, paramWrapper } = useStyles().classes

	const updateParams = ({ key, value, isChecked }: { key?: string; value?: string; isChecked?: boolean }, index: number) => {
		let tail = null
		if (index === items.length - 1) {
			tail = { isChecked: true, key: '', value: '' }
		}

		const item = items[index]
		const updatedItem = {
			key: key ?? item.key,
			value: value ?? item.value,
			isChecked: isChecked ?? item.isChecked,
		}

		const updatedData = [...items.slice(0, index), updatedItem, ...items.slice(index + 1), tail].filter(Boolean) as ParamItem[]

		if (onItemsChange) {
			onItemsChange(updatedData)
		}
	}

	const removeParam = (index: number) => () => {
		const updatedData = [...items]
		updatedData.splice(index, 1)

		if (onItemsChange) {
			onItemsChange(updatedData)
		}
	}

	const isNotLastIndex = (index: number) => index !== items.length - 1

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
				{items.map(({ key, value, isChecked }, index) => (
					<tr key={index}>
						<td>
							{isNotLastIndex(index) && !readonly && (
								<Checkbox color="gray" checked={isChecked} onChange={(event) => updateParams({ isChecked: event.target.checked }, index)} />
							)}
						</td>
						<td>
							<TextInput
								classNames={{ input: paramInput, wrapper: paramWrapper }}
								value={key}
								onChange={(event) => updateParams({ key: event.target.value }, index)}
								placeholder="key"
								readOnly={readonly}
							/>
						</td>
						<td>
							<TextInput
								classNames={{ input: paramInput, wrapper: paramWrapper }}
								value={value}
								onChange={(event) => updateParams({ value: event.target.value }, index)}
								placeholder="value"
								readOnly={readonly}
							/>
						</td>
						<td>
							{isNotLastIndex(index) && !readonly && (
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
