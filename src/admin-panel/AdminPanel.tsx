import { DetailView } from './DetailView'
import { ListView } from './ListView'

export function AdminPanel() {
	const queryParams = new URLSearchParams(document.location.search)

	const addNewMenuSlug = 'inseri-core-add-new-page'
	const addNewPath = 'admin.php?page=' + addNewMenuSlug

	const showAddNew = queryParams.get('page') === addNewMenuSlug

	return showAddNew ? <DetailView mode="create" /> : <ListView addNewPath={addNewPath} />
}
