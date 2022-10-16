import { PAGES } from './config'
import { DetailView } from './DetailView'
import { ListView } from './ListView'

export function AdminPanel() {
	const queryParams = new URLSearchParams(document.location.search)
	const showAddNew = queryParams.get('page') === PAGES['add-new']

	return showAddNew ? <DetailView mode="create" /> : <ListView />
}
