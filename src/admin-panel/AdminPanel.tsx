import { useEffect } from '@wordpress/element'
import { Box, useGlobalState, DetailViewBody, DatasourceState } from '../components'
import { PAGES } from '../utils'
import { ListView } from './ListView'
import { DetailViewHeading } from './DetailViewHeading'

export function AdminPanel() {
	const queryParams = new URLSearchParams(document.location.search)
	const showAddNew = queryParams.get('page') === PAGES['add-new']

	const mode = useGlobalState((state: DatasourceState) => state.mode)
	const { updateState } = useGlobalState((state: DatasourceState) => state.actions)

	useEffect(() => {
		if (showAddNew) {
			updateState({ mode: 'create' })
		}
	}, [showAddNew])

	if (mode !== 'none') {
		return (
			<>
				<DetailViewHeading />
				<Box mt="lg" mx={36}>
					<DetailViewBody />
				</Box>
			</>
		)
	}

	return <ListView />
}
