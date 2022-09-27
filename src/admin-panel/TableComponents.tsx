import { __ } from '@wordpress/i18n'
import { Button, createStyles, SortableTh, Stack, Text, Title } from '../components'
import { Datasource } from './ApiServer'

const useStyles = createStyles((theme) => ({
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
	col4: {
		maxWidth: '0',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
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
	const { col0, col1, col2, col3, col4 } = useStyles().classes
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
				<SortableTh className={col4} sorted={sortBy === 'url'} reversed={isReversed} onSort={sortData('url')}>
					{__('URL', 'inseri-core')}
				</SortableTh>
			</tr>
		</thead>
	)
}

interface ContentProps {
	datasources: Datasource[]
}
export function ContentTableBody({ datasources }: ContentProps) {
	const { col0, col1, col2, col3, col4 } = useStyles().classes

	return (
		<tbody>
			{datasources.map((d) => (
				<tr key={d.id}>
					<td className={col0}>{d.description}</td>
					<td className={col1}>{d.author_name}</td>
					<td className={col2}>{d.type}</td>
					<td className={col3}>{d.method}</td>
					<td className={col4}>{d.url}</td>
				</tr>
			))}
		</tbody>
	)
}

interface EmptyProps {
	title: string
	description: string
	buttonText?: string
	onClick?: () => {}
}
export function EmptyTableBody({ title, description, buttonText, onClick }: EmptyProps) {
	return (
		<tbody>
			<tr>
				<td colSpan={5}>
					<Stack align="center" spacing={1}>
						<Title order={2} size="h4">
							{title}
						</Title>
						<Text>{description}</Text>
						{buttonText && (
							<Button size="sm" mt="sm" onClick={onClick}>
								{buttonText}
							</Button>
						)}
					</Stack>
				</td>
			</tr>
		</tbody>
	)
}
