import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'
import './editor.scss'
import { Button } from '../../components'
import { useEffect, useState } from '@wordpress/element'

export default function Edit({ setAttributes }: BlockEditProps<any>) {
	const [counter, setCounter] = useState(0)
	useEffect(() => {
		const h = InseriCore.addBlock('block-b', [{ description: 'Counter', contentType: 'text/plain', key: 'counter' }])
		setAttributes({ handle: h })

		return () => InseriCore.removeBlock(h)
	}, [])

	return (
		<div {...useBlockProps()} style={{ padding: '8px' }}>
			<span>Counter: {counter}</span> <br />
			<Button onClick={() => setCounter(counter + 1)}>+</Button>
			<Button onClick={() => setCounter(counter - 1)}>-</Button>
		</div>
	)
}
