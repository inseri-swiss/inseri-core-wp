import { useState, useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Table, Select, Group, Button, createStyles, Title, TextInput, MediaQuery, SortableTh, Stack, Text } from '../components'
import { Datasource, getData } from './ApiServer'

const useStyles = createStyles((theme) => ({
	compactBtn: {
		fontWeight: 600,
		backgroundColor: '#f6f7f7',
	},
	secondaryBtn: {
		backgroundColor: '#f6f7f7',
	},
	table: {
		border: '1px solid #c3c4c7',
		background: '#fff',
		width: '100%',
	},
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

export function AdminPanel() {
	const { compactBtn, secondaryBtn, table: tableClass, col0, col1, col2, col3, col4 } = useStyles().classes

	const ALL_AUTHORS = 'All Authors'
	const ALL_TYPES = 'All Types'

	const [datasources, setDatasources] = useState<Datasource[]>([])
	const [authors, setAuthors] = useState<string[]>([ALL_AUTHORS])
	const [types, setTypes] = useState<string[]>([ALL_TYPES])

	const methods = [
		'All Methods',
		'GET',
		'HEAD',
		'POST',
		'PUT',
		'DELETE',
		'OPTIONS',
		'PATCH',
	]

	const [filterForAuthor, setFilterForAuthor] = useState<string | null>(authors[0])
	const [filterForType, setFilterForType] = useState<string | null>(types[0])
	const [filterForMethod, setFilterForMethod] = useState<string | null>(methods[0])

	useEffect(() => {
		getData().then((data) => setDatasources(data))
	}, [])

	useEffect(() => {
		const uniqueAuthors = new Set(datasources.map((d) => d.author_name ?? ''))
		setAuthors([ALL_AUTHORS, ...Array.from(uniqueAuthors)])

		const uniqueTypes = new Set(datasources.map((d) => d.type ?? ''))
		setTypes([ALL_TYPES, ...Array.from(uniqueTypes)])
	}, [datasources])

	return (
		<Box mr="lg" my="lg">
			<Group mb="lg" spacing="xs">
				<Title order={1} size="h3" weight={400}>
					{__('Data Sources - Inseri', 'inseri-core')}
				</Title>
				<Button variant="outline" classNames={{ root: compactBtn }} size="sm" compact>
					{__('Add New', 'inseri-core')}
				</Button>
			</Group>

			<MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
				<Group my="xs" spacing={6}>
					<Select aria-label={__('Filter by Author', 'inseri-core')} onChange={setFilterForAuthor} value={filterForAuthor} data={authors} />
					<Select aria-label={__('Filter by Type', 'inseri-core')} onChange={setFilterForType} value={filterForType} data={types} />
					<Select aria-label={__('Filter by Method', 'inseri-core')} onChange={setFilterForMethod} value={filterForMethod} data={methods} />
					<Button variant="outline" classNames={{ root: secondaryBtn }}>
						{__('Filter', 'inseri-core')}
					</Button>

					<div style={{ flex: 1 }} />

					<TextInput aria-label={__('Search Data Sources', 'inseri-core')} />
					<Button variant="outline" classNames={{ root: secondaryBtn }}>
						{__('Search Data Sources', 'inseri-core')}
					</Button>
				</Group>
			</MediaQuery>
			<Table striped className={tableClass} verticalSpacing="md">
				<thead>
					<tr>
						<SortableTh className={col0} sorted={false} reversed={false} onSort={() => {}}>
							{__('Name', 'inseri-core')}
						</SortableTh>
						<SortableTh className={col1} sorted={false} reversed={false} onSort={() => {}}>
							{__('Author', 'inseri-core')}
						</SortableTh>
						<SortableTh className={col2} sorted={false} reversed={false} onSort={() => {}}>
							{__('Type', 'inseri-core')}
						</SortableTh>
						<SortableTh className={col3} sorted={false} reversed={false} onSort={() => {}}>
							{__('Method', 'inseri-core')}
						</SortableTh>
						<SortableTh className={col4} sorted={false} reversed={false} onSort={() => {}}>
							{__('URL', 'inseri-core')}
						</SortableTh>
					</tr>
				</thead>
				<tbody>
					{datasources.length > 0 ? (
						datasources.map((d) => (
							<tr key={d.id}>
								<td className={col0}>{d.description}</td>
								<td className={col1}>{d.author_name}</td>
								<td className={col2}>{d.type}</td>
								<td className={col3}>{d.method}</td>
								<td className={col4}>{d.url}</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={5}>
								<Stack align="center" spacing={1}>
									<Title order={2} size="h4">
										{__('No data sources found', 'inseri-core')}
									</Title>
									<Text>{__('To fetch data in posts or in pages, add new data repository', 'inseri-core')}</Text>
									<Button size="sm" mt="sm">
										{__('Add New Data Source', 'inseri-core')}
									</Button>
								</Stack>
							</td>
						</tr>
					)}
				</tbody>
			</Table>
		</Box>
	)
}
