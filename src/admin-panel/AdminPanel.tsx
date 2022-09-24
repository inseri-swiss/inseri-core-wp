import { useState } from '@wordpress/element'
import { Box, Table, Select, Group, Button, createStyles, Title, TextInput, MediaQuery, SortableTh } from '../components'

const useStyles = createStyles({
	// Button
	root: {
		fontWeight: 600,
	},
	table: {
		border: '1px solid #c3c4c7',
		background: '#fff',
		width: '100%',
	},
	col0: { width: '20%' },
	col1: { width: '15%' },
	col2: { width: '10%' },
	col3: { width: '10%' },
	col4: {
		maxWidth: '0',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
})

export function AdminPanel() {
	const { root: buttonRoot, table: tableClass, col0, col1, col2, col3, col4 } = useStyles().classes

	const authors = ['All Authors']
	const types = ['All Types']
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

	return (
		<Box mr="lg" my="lg">
			<Group mb="lg" spacing="xs">
				<Title order={1} size="h3" weight={400}>
					Data Sources - Inseri
				</Title>
				<Button variant="outline" classNames={{ root: buttonRoot }} size="sm" compact>
					Add New
				</Button>
			</Group>

			<MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
				<Group my="xs" spacing={6}>
					<Select aria-label={'Filter by Author'} onChange={setFilterForAuthor} value={filterForAuthor} data={authors} />
					<Select aria-label={'Filter by Type'} onChange={setFilterForType} value={filterForType} data={types} />
					<Select aria-label={'Filter by Method'} onChange={setFilterForMethod} value={filterForMethod} data={methods} />
					<Button variant="outline" size="xs">
						Filter
					</Button>

					<div style={{ flex: 1 }} />

					<TextInput aria-label="Search Data Sources" />
					<Button variant="outline">Search Data Sources</Button>
				</Group>
			</MediaQuery>
			<Table striped className={tableClass} verticalSpacing="md">
				<thead>
					<tr>
						<SortableTh className={col0} sorted={false} reversed={false} onSort={() => {}}>
							Name
						</SortableTh>
						<SortableTh className={col1} sorted={false} reversed={false} onSort={() => {}}>
							Author
						</SortableTh>
						<SortableTh className={col2} sorted={false} reversed={false} onSort={() => {}}>
							Type
						</SortableTh>
						<SortableTh className={col3} sorted={false} reversed={false} onSort={() => {}}>
							Method
						</SortableTh>
						<SortableTh className={col4} sorted={false} reversed={false} onSort={() => {}}>
							URL
						</SortableTh>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className={col0}>Foo Bar Uni</td>
						<td className={col1}>Admin</td>
						<td className={col2}>REST</td>
						<td className={col3}>GET</td>
						<td className={col4}>https://www.inseri.swiss/</td>
					</tr>
				</tbody>
			</Table>
		</Box>
	)
}
