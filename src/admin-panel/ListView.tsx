import { getHotkeyHandler } from '@mantine/hooks'
import { IconX } from '@tabler/icons'
import { useEffect, useRef, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import axios from 'axios'
import logo from '../assets/inseri_logo.png'
import { ActionIcon, Alert, Box, Button, createStyles, Group, MediaQuery, Select, Table, TextInput, Title } from '../components'
import { Datasource, getAllItems, removeItem } from './ApiServer'
import { HTTP_METHODS, PAGES } from './config'
import { ContentTableBody, EmptyTableBody, SortableColumns, TableHeader } from './TableComponents'

interface Props {
	onItemClick: (id: number) => void
}

const useStyles = createStyles((theme) => ({
	titleBar: {
		border: '1px solid' + theme.colors.gray[4],
		background: '#fff',
	},
	primaryBtn: {
		fontWeight: 'bold',
		'&:hover': {
			color: '#fff',
		},
		'&:focus': {
			color: '#fff',
		},
		'&:active': {
			color: '#fff',
		},
	},
	secondaryBtn: {
		backgroundColor: '#f6f7f7',
	},
	table: {
		border: '1px solid #c3c4c7',
		background: '#fff',
		width: '100%',
	},
	alertRoot: {
		borderWidth: '2px',
	},
}))

const ALL_AUTHORS = __('All Authors', 'inseri-core')
const ALL_TYPES = __('All Types', 'inseri-core')
const ALL_METHODS = __('All Methods', 'inseri-core')
const methods = [ALL_METHODS, ...HTTP_METHODS]
const ADD_NEW_PATH = 'admin.php?page=' + PAGES['add-new']

export function ListView({ onItemClick }: Props) {
	const { secondaryBtn, table: tableClass, titleBar, primaryBtn, alertRoot } = useStyles().classes

	const [rawDatasources, setRawDatasources] = useState<Datasource[]>([])
	const [datasources, setDatasources] = useState<Datasource[]>([])

	const [authors, setAuthors] = useState<string[]>([ALL_AUTHORS])
	const [types, setTypes] = useState<string[]>([ALL_TYPES])

	const [searchboxText, setSearchboxText] = useState<string>('')

	const [filterByAuthor, setFilterByAuthor] = useState<string | null>(authors[0])
	const [filterByType, setFilterByType] = useState<string | null>(types[0])
	const [filterByMethod, setFilterByMethod] = useState<string | null>(methods[0])
	const [sortDataBy, setSortDataBy] = useState<SortableColumns>(null)
	const [isReversed, setSortDirection] = useState(false)

	const [pageError, setPageError] = useState('')

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
		loadDatasources()
	}, [])

	useEffect(() => {
		setDatasources(rawDatasources)

		const uniqueAuthors = new Set(rawDatasources.map((d) => d.author_name ?? ''))
		setAuthors([ALL_AUTHORS, ...Array.from(uniqueAuthors)])

		const uniqueTypes = new Set(rawDatasources.map((d) => d.type ?? ''))
		setTypes([ALL_TYPES, ...Array.from(uniqueTypes)])
	}, [rawDatasources])

	const searchboxRef = useRef<HTMLInputElement>(null)

	const setFilterByString = (filterType: SortableColumns) => (value: string) => {
		if (filterType === 'author_name') {
			setFilterByAuthor(value)
		}

		if (filterType === 'type') {
			setFilterByType(value)
		}

		if (filterType === 'method') {
			setFilterByMethod(value)
		}
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

	const loadDatasources = async () => {
		const response = await getAllItems()
		setRawDatasources(response.data)
	}

	const deleteDatasource = (id: number) => async () => {
		try {
			await removeItem(id)
			loadDatasources()
		} catch (exception) {
			if (exception instanceof axios.AxiosError && exception.response && exception.response.data.message) {
				const { data, status, statusText } = exception.response
				setPageError(`${status} ${statusText}: ${data.message}`)
			} else {
				setPageError(__('Refresh the page and try it again.', 'inseri-core'))
			}
		}
	}

	return (
		<>
			<Group px={36} py="md">
				<img src={logo} height="36" alt="inseri logo" />
			</Group>
			<Group px={36} py="sm" className={titleBar}>
				<Title order={1} size="h3">
					{__('All Data Sources', 'inseri-core')}
				</Title>
				<Button classNames={{ root: primaryBtn }} size="sm" component="a" href={ADD_NEW_PATH}>
					{__('Add New', 'inseri-core')}
				</Button>
			</Group>

			{pageError && (
				<Alert
					mt="sm"
					mx={36}
					title={__('An error occurred', 'inseri-core')}
					variant="outline"
					color="red"
					classNames={{ root: alertRoot }}
					onClose={() => setPageError('')}
					withCloseButton
				>
					{pageError}
				</Alert>
			)}

			<Box px={36} mt="md">
				<MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
					<Group my="xs" spacing={6}>
						<Select aria-label={__('Filter by Author', 'inseri-core')} value={filterByAuthor} onChange={setFilterByAuthor} data={authors} />
						<Select aria-label={__('Filter by Type', 'inseri-core')} value={filterByType} onChange={setFilterByType} data={types} />
						<Select aria-label={__('Filter by Method', 'inseri-core')} value={filterByMethod} onChange={setFilterByMethod} data={methods} />

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
					{datasources.length > 0 ? (
						<ContentTableBody datasources={datasources} onDelete={deleteDatasource} onNameClick={onItemClick} onSelectClick={setFilterByString} />
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
					)}
				</Table>
			</Box>
		</>
	)
}
