import { exportAsJson } from '@inseri/lighthouse'
import { Button, useGlobalState } from '../../components'
import { GlobalState } from './state'
import { IconShare } from '@tabler/icons-react'

export default function View() {
	const { text, showIcon } = useGlobalState((state: GlobalState) => state)

	return (
		<Button
			style={{ color: '#fff' }}
			leftIcon={showIcon && <IconShare style={{ fill: 'none' }} size="1rem" />}
			onClick={() => {
				const url = window.location.href
				const combinedUrl = `${url}#${exportAsJson()}`
				navigator.clipboard.writeText(combinedUrl)
			}}
		>
			{text}
		</Button>
	)
}
