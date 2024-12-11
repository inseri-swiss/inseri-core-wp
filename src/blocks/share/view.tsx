import { exportAsJson } from '@inseri/lighthouse'
import { Button } from '@mantine/core'
import { useGlobalState } from '../../components/StateProvider'
import { GlobalState } from './state'
import { IconShare } from '@tabler/icons-react'
import { useClipboard } from '@mantine/hooks'

interface Prop {
	getPermalink?: () => string
}

export default function View({ getPermalink }: Prop) {
	const { text, copiedText, showIcon } = useGlobalState((state: GlobalState) => state)
	const clipboard = useClipboard({ timeout: 750 })

	return (
		<Button
			style={{ color: !clipboard.copied ? '#fff' : undefined }}
			leftIcon={showIcon && <IconShare style={{ fill: 'none' }} size="1rem" />}
			variant={clipboard.copied ? 'outline' : 'filled'}
			onClick={() => {
				const base = getPermalink ? getPermalink() : window.location.href
				const url = base.split('#')[0]
				const combinedUrl = `${url}#${exportAsJson()}`
				clipboard.copy(combinedUrl)
			}}
		>
			{clipboard.copied ? copiedText : text}
		</Button>
	)
}
