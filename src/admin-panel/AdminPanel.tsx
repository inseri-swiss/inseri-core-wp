import { useState, useEffect, useRef } from '@wordpress/element'
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

type SortableColumns = null | 'description' | 'type' | 'author_name' | 'method' | 'url'

const ALL_AUTHORS = __('All Authors', 'inseri-core')
const ALL_TYPES = __('All Types', 'inseri_core')
const ALL_METHODS = __('All Methods', 'inseri_core')

export function AdminPanel() {
	const { compactBtn, secondaryBtn, table: tableClass, col0, col1, col2, col3, col4 } = useStyles().classes

	const [rawDatasources, setRawDatasources] = useState<Datasource[]>([])
	const [datasources, setDatasources] = useState<Datasource[]>([])

	const [authors, setAuthors] = useState<string[]>([ALL_AUTHORS])
	const [types, setTypes] = useState<string[]>([ALL_TYPES])
	const methods = [
		ALL_METHODS,
		'GET',
		'HEAD',
		'POST',
		'PUT',
		'DELETE',
		'OPTIONS',
		'PATCH',
	]

	const [filterByAuthor, setFilterByAuthor] = useState<string>(authors[0])
	const [filterByType, setFilterByType] = useState<string>(types[0])
	const [filterByMethod, setFilterByMethod] = useState<string>(methods[0])
	const [sortDataBy, setSortDataBy] = useState<SortableColumns>(null)
	const [isReversed, setSortDirection] = useState(false)

	const sortData = (column: SortableColumns) => () => {
		const newReversed = column === sortDataBy ? !isReversed : false
		setSortDirection(newReversed)
		setSortDataBy(column)
	}

	const filterAndSortData = () => {
		let rearrangedData = [...rawDatasources]

		const filters: [string | null, string, keyof Datasource][] = [
			[filterByAuthor, ALL_AUTHORS, 'author_name'],
			[filterByType, ALL_TYPES, 'type'],
			[filterByMethod, ALL_METHODS, 'method'],
		]

		filters.forEach(([filterBy, ALL, property]) => {
			if (filterBy !== ALL) {
				rearrangedData = rearrangedData.filter((item) => item[property] === filterBy)
			}
		})

		if (sortDataBy !== null) {
			rearrangedData = rearrangedData.sort((a, b) => a[sortDataBy]?.localeCompare(b[sortDataBy]))

			if (isReversed) {
				rearrangedData.reverse()
			}
		}

		setDatasources(rearrangedData)
	}
	useEffect(filterAndSortData, [
		filterByAuthor,
		filterByMethod,
		filterByType,
		sortDataBy,
		isReversed,
	])

	useEffect(() => {
		getData().then((data) => {
			setDatasources(data)
			setRawDatasources(data)
		})
	}, [])

	useEffect(() => {
		const uniqueAuthors = new Set(rawDatasources.map((d) => d.author_name ?? ''))
		setAuthors([ALL_AUTHORS, ...Array.from(uniqueAuthors)])

		const uniqueTypes = new Set(rawDatasources.map((d) => d.type ?? ''))
		setTypes([ALL_TYPES, ...Array.from(uniqueTypes)])
	}, [rawDatasources])

	const authorSelectRef = useRef<HTMLInputElement>(null)
	const typeSelectRef = useRef<HTMLInputElement>(null)
	const methodSelectRef = useRef<HTMLInputElement>(null)

	const chooseFilters = () => {
		setFilterByAuthor(authorSelectRef.current?.value ?? ALL_AUTHORS)
		setFilterByType(typeSelectRef.current?.value ?? ALL_TYPES)
		setFilterByMethod(methodSelectRef.current?.value ?? ALL_METHODS)
	}

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
					<Select aria-label={__('Filter by Author', 'inseri-core')} defaultValue={ALL_AUTHORS} ref={authorSelectRef} data={authors} />
					<Select aria-label={__('Filter by Type', 'inseri-core')} defaultValue={ALL_TYPES} ref={typeSelectRef} data={types} />
					<Select aria-label={__('Filter by Method', 'inseri-core')} defaultValue={ALL_METHODS} ref={methodSelectRef} data={methods} />
					<Button variant="outline" classNames={{ root: secondaryBtn }} onClick={chooseFilters}>
						{__('Filter', 'inseri-core')}
					</Button>

					<div style={{ flex: 1 }} />

					<TextInput aria-label={__('Search Data Sources', 'inseri-core')} />
					<Button variant="outline" classNames={{ root: secondaryBtn }} onClick={() => {}}>
						{__('Search Data Sources', 'inseri-core')}
					</Button>
				</Group>
			</MediaQuery>
			<Table striped className={tableClass} verticalSpacing="md">
				<thead>
					<tr>
						<SortableTh className={col0} sorted={sortDataBy === 'description'} reversed={isReversed} onSort={sortData('description')}>
							{__('Name', 'inseri-core')}
						</SortableTh>
						<SortableTh className={col1} sorted={sortDataBy === 'author_name'} reversed={isReversed} onSort={sortData('author_name')}>
							{__('Author', 'inseri-core')}
						</SortableTh>
						<SortableTh className={col2} sorted={sortDataBy === 'type'} reversed={isReversed} onSort={sortData('type')}>
							{__('Type', 'inseri-core')}
						</SortableTh>
						<SortableTh className={col3} sorted={sortDataBy === 'method'} reversed={isReversed} onSort={sortData('method')}>
							{__('Method', 'inseri-core')}
						</SortableTh>
						<SortableTh className={col4} sorted={sortDataBy === 'url'} reversed={isReversed} onSort={sortData('url')}>
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
