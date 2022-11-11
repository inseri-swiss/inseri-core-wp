import { useEffect, useState } from '@wordpress/element'
import { Button } from '../../components'

export function Component({ attributes }: { attributes: any }) {
	const [counter, setCounter] = useState(0)
	const dispatch = InseriCore.createDispatch(attributes?.handle, 'counter')
	useEffect(() => {
		dispatch({ value: counter })
	}, [counter])

	return (
		<div style={{ padding: '8px' }}>
			<span>Counter: {counter}</span> <br />
			<Button onClick={() => setCounter(counter + 1)}>+</Button>
			<Button onClick={() => setCounter(counter - 1)}>-</Button>
		</div>
	)
}
