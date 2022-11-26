import domReady from '@wordpress/dom-ready'
import { Button } from '../../components'
import * as inseri from '@inseri/lighthouse'
import { render } from '@wordpress/element'

function Component({ attributes }: any) {
	const fooDispatch = inseri.useDispatch(attributes.output)

	const val = inseri.useWatch(attributes.input)

	return (
		<div>
			<Button onClick={() => fooDispatch({ value: Math.random() })}>Set new value</Button>
			<br />
			<span>Value: {val.value}</span>
		</div>
	)
}

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core')
	if (items) {
		Array.from(items).forEach((item) => {
			const attributes = JSON.parse((item as any).dataset.attributes)
			render(<Component attributes={attributes} />, item)
		})
	}
}

domReady(initReactComponents)
