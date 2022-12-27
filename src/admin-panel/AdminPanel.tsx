import { useEffect } from '@wordpress/element'
import { useGlobalState } from '../components'
import { PAGES } from './config'
import { DetailView } from './DetailView'
import { ListView } from './ListView'
import { AdminState } from './state'

export function AdminPanel() {
	const queryParams = new URLSearchParams(document.location.search)
	const showAddNew = queryParams.get('page') === PAGES['add-new']

	const mode = useGlobalState((state: AdminState) => state.mode)
	const { updateState } = useGlobalState((state: AdminState) => state.actions)

	useEffect(() => {
		if (showAddNew) {
			updateState({ mode: 'create' })
		}
	}, [showAddNew])

	if (mode !== 'none') {
		return <DetailView />
	}

	return <ListView />
}
