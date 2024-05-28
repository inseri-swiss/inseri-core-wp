import { Box, useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	const {} = useGlobalState((state: GlobalState) => state)

	return <Box py={'md'}>Export</Box>
}
