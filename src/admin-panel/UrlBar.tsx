import { Group, Select, TextInput, Button, createStyles } from '../components'
import { __ } from '@wordpress/i18n'
import { HTTP_METHODS } from './config'
import { useEffect, useState } from '@wordpress/element'
import { useDebouncedValue } from '@mantine/hooks'

const useStyles = createStyles((theme, _params, getRef) => ({
	sendBtn: {
		fontWeight: 'bold',
		background: theme.colors.blue[1],
		color: '#0d3459',
	},
	methodRoot: {
		width: '8em',
	},
	methodInput: {
		ref: getRef('method-input'),
	},
	methodWrapper: {
		[`& > .${getRef('method-input')}`]: {
			borderTopRightRadius: 0,
			borderBottomRightRadius: 0,
		},
	},
	urlInput: {
		ref: getRef('url-input'),
	},
	urlWrapper: {
		[`& > .${getRef('url-input')}`]: {
			borderTopLeftRadius: 0,
			borderBottomLeftRadius: 0,
			borderLeftWidth: 0,
		},
	},
	urlRoot: {
		flex: 1,
	},
}))

interface Props {
	method: string
	onMethodChange: (method: string) => void
	url: string
	onUrlChange: (url: string) => void
	onTryClick: () => void
	isLoadingRequest: boolean
}

export function UrlBar({ method, onMethodChange, url, onUrlChange, onTryClick, isLoadingRequest }: Props) {
	const { sendBtn, methodRoot, methodInput, methodWrapper, urlInput, urlWrapper, urlRoot } = useStyles().classes

	const [urlError, setUrlError] = useState('')
	const [debouncedUrl] = useDebouncedValue(url, 500)
	const isNotReady = !url || !!urlError

	useEffect(() => {
		try {
			if (debouncedUrl) {
				new URL(debouncedUrl)
			}
		} catch (exception) {
			setUrlError(__('invalid URL', 'inseri-core'))
		}
	}, [debouncedUrl])

	return (
		<Group px="md" pt="lg" pb="xs" align="flex-start">
			<Group spacing={0} style={{ flex: 1, alignItems: 'baseline' }}>
				<Select
					classNames={{ root: methodRoot, wrapper: methodWrapper, input: methodInput }}
					aria-label={__('HTTP Method', 'inseri-core')}
					data={HTTP_METHODS}
					value={method}
					onChange={onMethodChange}
				/>
				<TextInput
					classNames={{ root: urlRoot, wrapper: urlWrapper, input: urlInput }}
					aria-label={__('URL', 'inseri-core')}
					placeholder={__('Enter your URL', 'inseri-core')}
					value={url}
					onChange={(e) => {
						onUrlChange(e.currentTarget.value)
						setUrlError('')
					}}
					error={urlError}
				/>
			</Group>
			<Button classNames={{ root: sendBtn }} variant="light" size="sm" onClick={onTryClick} uppercase disabled={isNotReady} loading={isLoadingRequest}>
				{__('Try Request', 'inseri-core')}
			</Button>
		</Group>
	)
}
