import { IconX } from '@tabler/icons'
import { useEffect, useRef, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { ActionIcon, Box, Button, createStyles, Group, MediaQuery, Select, Table, TextInput, Title } from '../components'

import { getHotkeyHandler } from '@mantine/hooks'
import { Datasource, getData } from './ApiServer'
import { ContentTableBody, EmptyTableBody, SortableColumns, TableHeader } from './TableComponents'

interface Props {
	addNewPath: string
}

const useStyles = createStyles((_theme) => ({
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
}))

const ALL_AUTHORS = __('All Authors', 'inseri-core')
const ALL_TYPES = __('All Types', 'inseri_core')
const ALL_METHODS = __('All Methods', 'inseri_core')

export function ListView({ addNewPath }: Props) {
	const { compactBtn, secondaryBtn, table: tableClass } = useStyles().classes

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

	const [searchboxText, setSearchboxText] = useState<string>('')

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

		if (searchboxText) {
			rearrangedData = rearrangedData.filter(({ description, url }) => {
				const searchKey = searchboxText.toLowerCase()
				return description.toLowerCase().includes(searchKey) || url.toLowerCase().includes(searchKey)
			})
		}

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
		searchboxText,
	])

	useEffect(() => {
		getData().then((data) => setRawDatasources(data))
	}, [])

	useEffect(() => {
		setDatasources(rawDatasources)

		const uniqueAuthors = new Set(rawDatasources.map((d) => d.author_name ?? ''))
		setAuthors([ALL_AUTHORS, ...Array.from(uniqueAuthors)])

		const uniqueTypes = new Set(rawDatasources.map((d) => d.type ?? ''))
		setTypes([ALL_TYPES, ...Array.from(uniqueTypes)])
	}, [rawDatasources])

	const authorSelectRef = useRef<HTMLInputElement>(null)
	const typeSelectRef = useRef<HTMLInputElement>(null)
	const methodSelectRef = useRef<HTMLInputElement>(null)
	const searchboxRef = useRef<HTMLInputElement>(null)

	const chooseFilters = () => {
		setFilterByAuthor(authorSelectRef.current?.value ?? ALL_AUTHORS)
		setFilterByType(typeSelectRef.current?.value ?? ALL_TYPES)
		setFilterByMethod(methodSelectRef.current?.value ?? ALL_METHODS)
	}

	const searchDatasources = () => {
		setSearchboxText(searchboxRef.current?.value ?? '')
	}

	const clearSearbox = () => {
		if (searchboxRef.current) {
			searchboxRef.current.value = ''
		}
		setSearchboxText('')
	}

	return (
		<Box m="lg">
			<Group mb="lg" spacing="xs">
				<Title order={1} size="h3" weight={400}>
					{__('Data Sources - Inseri', 'inseri-core')}
				</Title>
				<Button variant="outline" classNames={{ root: compactBtn }} component="a" href={addNewPath} size="sm" compact>
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

					<TextInput
						aria-label={__('Search Data Sources', 'inseri-core')}
						ref={searchboxRef}
						onKeyDown={getHotkeyHandler([['Enter', searchDatasources]])}
						rightSection={
							searchboxText && (
								<ActionIcon size="xs" onClick={clearSearbox}>
									<IconX />
								</ActionIcon>
							)
						}
					/>
					<Button variant="outline" classNames={{ root: secondaryBtn }} onClick={searchDatasources}>
						{__('Search Data Sources', 'inseri-core')}
					</Button>
				</Group>
			</MediaQuery>
			<Table striped className={tableClass} verticalSpacing="md">
				<TableHeader sortBy={sortDataBy} isReversed={isReversed} sortData={sortData} />
				{
					// eslint-disable-next-line no-nested-ternary
					datasources.length > 0 ? (
						<ContentTableBody datasources={datasources} />
					) : rawDatasources.length > 0 ? (
						<EmptyTableBody
							title={__('No data sources found', 'inseri-core')}
							description={__('Try adjusting your search or filters', 'inseri-core')}
						></EmptyTableBody>
					) : (
						<EmptyTableBody
							title={__('No data sources yet', 'inseri-core')}
							description={__('To fetch data in posts or in pages, add new data repository', 'inseri-core')}
							buttonText={__('Add New Data Source', 'inseri-core')}
						></EmptyTableBody>
					)
				}
			</Table>
		</Box>
	)
}
