import { Group, Select, TextInput, Button, createStyles } from '../components'
import { __ } from '@wordpress/i18n'
import { HTTP_METHODS } from './config'

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
}

export function UrlBar({ method, onMethodChange, url, onUrlChange }: Props) {
	const { sendBtn, methodRoot, methodInput, methodWrapper, urlInput, urlWrapper, urlRoot } = useStyles().classes

	return (
		<Group px="md" py="lg">
			<Group spacing={0} style={{ flex: 1 }}>
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
					onChange={(e) => onUrlChange(e.currentTarget.value)}
				/>
			</Group>
			<Button classNames={{ root: sendBtn }} variant="light" size="sm" uppercase>
				{__('Try Request', 'inseri-core')}
			</Button>
		</Group>
	)
}
