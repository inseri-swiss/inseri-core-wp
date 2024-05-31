import { Button, useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	const { postId } = useGlobalState((state: GlobalState) => state)

	return (
		<Button style={{ color: '#fff' }} component="a" href={`${inseriApiSettings.root}inseri-core/v1/archive/${postId}`} download={'archive.zip'}>
			Export
		</Button>
	)
}
