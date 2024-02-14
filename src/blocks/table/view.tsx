import { useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	//const { inputColumns, inputData } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	updateState

	return <div />
}
