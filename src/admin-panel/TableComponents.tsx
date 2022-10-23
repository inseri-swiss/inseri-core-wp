import { useInterval } from '@mantine/hooks'
import { IconTrash } from '@tabler/icons'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Button, createStyles, SortableTh, Stack, Text, Title } from '../components'
import { Datasource } from './ApiServer'

const DELAY_TIME = 5

const useStyles = createStyles((theme, _t, getRef) => ({
	col0: {
		minWidth: '120px',
		width: '20%',
		[theme.fn.smallerThan('sm')]: {
			width: '70%',
		},
	},
	col1: {
		minWidth: '120px',
		width: '15%',
		[theme.fn.smallerThan('sm')]: {
			width: '30%',
		},
	},
	col2: {
		minWidth: '120px',
		width: '10%',
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	col3: {
		minWidth: '120px',
		width: '10%',
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	col4Th: {
		maxWidth: '0',
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	col4: {
		maxWidth: '0',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	col5: {
		width: '50px',
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
	removeBtn: {
		ref: getRef('remove-btn'),
		border: '0',
		minWidth: '90px',

		background: `linear-gradient(to left, transparent 50%, ${theme.colors.yellow[1]} 50%) right`,
		backgroundSize: '200%',
		transition: 'none',

		'&:hover': {
			border: '1px solid ' + theme.colors.red[7],
			background: 'transparent',
			color: theme.colors.red[7],
		},
	},

	removeBtnActive: {
		[`&.${getRef('remove-btn')}`]: {
			transition: `${DELAY_TIME + 1}s ease-out background-position`,
			border: '2px solid ' + theme.colors.yellow[3],

			'&:hover': {
				background: theme.colors.yellow[2],
				color: 'inherit',
			},
		},
	},

	seamlessBtn: {
		color: theme.colors.blue[9],
		background: 'transparent',
		border: '0',
		padding: '0',

		'&:hover, &:focus, &:active': {
			border: '0',
			background: 'transparent',
		},
	},
}))

export type SortableColumns = null | 'description' | 'type' | 'author_name' | 'method' | 'url'

interface HeaderProps {
	sortBy: string | null
	isReversed: boolean
	sortData: (column: SortableColumns) => () => void
}

export function TableHeader({ sortBy, isReversed, sortData }: HeaderProps) {
	const { col0, col1, col2, col3, col4Th, col5 } = useStyles().classes
	return (
		<thead>
			<tr>
				<SortableTh className={col0} sorted={sortBy === 'description'} reversed={isReversed} onSort={sortData('description')}>
					{__('Name', 'inseri-core')}
				</SortableTh>
				<SortableTh className={col1} sorted={sortBy === 'author_name'} reversed={isReversed} onSort={sortData('author_name')}>
					{__('Author', 'inseri-core')}
				</SortableTh>
				<SortableTh className={col2} sorted={sortBy === 'type'} reversed={isReversed} onSort={sortData('type')}>
					{__('Type', 'inseri-core')}
				</SortableTh>
				<SortableTh className={col3} sorted={sortBy === 'method'} reversed={isReversed} onSort={sortData('method')}>
					{__('Method', 'inseri-core')}
				</SortableTh>
				<SortableTh className={col4Th} sorted={sortBy === 'url'} reversed={isReversed} onSort={sortData('url')}>
					{__('URL', 'inseri-core')}
				</SortableTh>
				<th className={col5}></th>
			</tr>
		</thead>
	)
}

interface ContentProps {
	datasources: Datasource[]
	onDelete: (id: number) => () => Promise<void>
	onNameClick: (id: number) => void
	onSelectClick: (type: 'author_name' | 'type' | 'method') => (value: string) => void
}
export function ContentTableBody({ datasources, onDelete, onNameClick, onSelectClick }: ContentProps) {
	const { col0, col1, col2, col3, col4, col5, seamlessBtn } = useStyles().classes

	return (
		<tbody>
			{datasources.map((d) => (
				<tr key={d.id}>
					<td className={col0}>
						<Button className={seamlessBtn} onClick={() => onNameClick(d.id)}>
							{d.description}
						</Button>
					</td>
					<td className={col1}>
						<Button className={seamlessBtn} onClick={() => onSelectClick('author_name')(d.author_name)}>
							{d.author_name}
						</Button>
					</td>
					<td className={col2}>
						<Button className={seamlessBtn} onClick={() => onSelectClick('type')(d.type)}>
							{d.type}
						</Button>
					</td>
					<td className={col3}>
						<Button className={seamlessBtn} onClick={() => onSelectClick('method')(d.method)}>
							{d.method}
						</Button>
					</td>
					<td className={col4}>{d.url}</td>
					<td className={col5}>
						<DeleteButton onDelete={onDelete(d.id)} />
					</td>
				</tr>
			))}
		</tbody>
	)
}
interface DeleteButtonProps {
	onDelete: () => Promise<void>
}

function DeleteButton({ onDelete }: DeleteButtonProps) {
	const { classes, cx } = useStyles()
	const { removeBtn, removeBtnActive } = classes

	const [countdown, setCountdown] = useState(DELAY_TIME)
	const interval = useInterval(() => setCountdown((s) => s - 1), 1000)
	const [isTriggered, setTriggered] = useState(false)

	useEffect(() => {
		if (countdown < 0) {
			interval.stop()
			setCountdown(DELAY_TIME)
			setTriggered(false)

			onDelete()
		}
	}, [countdown])

	const deleteClick = () => {
		if (isTriggered) {
			setTriggered(false)
			interval.stop()
			setCountdown(DELAY_TIME)
		} else {
			setTriggered(true)
			interval.start()
		}
	}

	return (
		<Button
			classNames={{ root: cx(removeBtn, isTriggered && removeBtnActive) }}
			style={{
				backgroundPosition: isTriggered ? 'left' : 'right',
			}}
			onClick={deleteClick}
			compact
			variant="outline"
			color="dark"
			data-active={isTriggered}
		>
			{isTriggered ? __('cancel', 'inseri-core') + ` (${countdown})` : <IconTrash size={18} />}
		</Button>
	)
}

interface EmptyProps {
	title: string
	description: string
	children?: JSX.Element
}
export function EmptyTableBody({ title, description, children }: EmptyProps) {
	return (
		<tbody>
			<tr>
				<td colSpan={5}>
					<Stack align="center" spacing={1}>
						<Title order={2} size="h4">
							{title}
						</Title>
						<Text>{description}</Text>
						{children}
					</Stack>
				</td>
			</tr>
		</tbody>
	)
}
