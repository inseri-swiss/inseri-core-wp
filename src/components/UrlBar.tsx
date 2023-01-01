import { __ } from '@wordpress/i18n'
import { Button, createStyles, Group, Select, TextInput } from './index'
import { HTTP_METHODS } from '../utils'

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
	urlError: string
	onUrlChange: (url: string) => void
	setUrlError: (error: string) => void
	onTryClick: () => void
	isLoadingRequest: boolean
	readonly?: boolean
}

export function UrlBar({ method, onMethodChange, url, onUrlChange, onTryClick, isLoadingRequest, urlError, setUrlError, readonly }: Props) {
	const { sendBtn, methodRoot, methodInput, methodWrapper, urlInput, urlWrapper, urlRoot } = useStyles().classes
	const isNotReady = !url || !!urlError

	return (
		<Group px="md" pt="lg" pb="xs" align="flex-start" spacing="sm">
			<Group spacing={0} style={{ flex: 1, alignItems: 'baseline' }}>
				<Select
					classNames={{ root: methodRoot, wrapper: methodWrapper, input: methodInput }}
					aria-label={__('HTTP Method', 'inseri-core')}
					data={HTTP_METHODS}
					value={method}
					onChange={onMethodChange}
					readOnly={readonly}
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
					readOnly={readonly}
				/>
			</Group>
			<Button classNames={{ root: sendBtn }} variant="light" onClick={onTryClick} uppercase disabled={isNotReady} loading={isLoadingRequest}>
				{__('Try Request', 'inseri-core')}
			</Button>
		</Group>
	)
}
