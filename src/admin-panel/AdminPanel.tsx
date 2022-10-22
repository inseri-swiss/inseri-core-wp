import { useState } from '@wordpress/element'
import { PAGES } from './config'
import { DetailView } from './DetailView'
import { ListView } from './ListView'

export function AdminPanel() {
	const queryParams = new URLSearchParams(document.location.search)
	const showAddNew = queryParams.get('page') === PAGES['add-new']

	const [itemId, setItemId] = useState<number | null>(null)

	if (showAddNew) {
		return <DetailView mode="create" />
	}

	if (itemId) {
		return <DetailView mode="edit" itemId={itemId} />
	}

	return <ListView onItemClick={setItemId} />
}
