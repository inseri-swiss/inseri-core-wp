import { useWatch } from '@inseri/lighthouse'
import { IconCircleOff } from '@tabler/icons-react'
import { __ } from '@wordpress/i18n'
import { Box, CodeEditor, Group, Text, createStyles, useGlobalState } from '../../components'
import { GlobalState } from './state'

const useViewStyles = createStyles({
	wrapper: {
		'&:hover': {
			borderRadius: '1px',
			boxShadow: '0 0 0 var(--wp-admin-border-width-focus) var(--wp-admin-theme-color)',
		},
	},
})

interface ViewProps {
	isGutenbergEditor?: boolean
	isSelected?: boolean
}

export default function View({ isGutenbergEditor, isSelected }: ViewProps) {
	const { input, mode } = useGlobalState((state: GlobalState) => state)
	const { value, status } = useWatch(input)
	const { wrapper } = useViewStyles().classes

	const isEmpty = !value || (typeof value === 'string' && !value.trim())
	let altText = __('No HTML code is set', 'inser-core')

	let preparedValue = value
	const hasError = status === 'error' || status === 'unavailable'

	if (hasError) {
		preparedValue = ''
		altText = __('An error has occurred', 'inser-core')
	}

	return mode === 'code' ? (
		<Box p="md">
			<CodeEditor type={'html'} value={preparedValue} />
		</Box>
	) : isEmpty || hasError ? (
		<Group
			align="center"
			position="center"
			style={{
				background: '#F8F9FA',
				color: '#868E96',
				padding: '8px',
			}}
		>
			<IconCircleOff size={40} />
			<Text size="xl" align="center">
				{altText}
			</Text>
		</Group>
	) : (
		<div
			className={isGutenbergEditor && !isSelected ? wrapper : undefined}
			style={{ minHeight: isGutenbergEditor ? '50px' : undefined }}
			dangerouslySetInnerHTML={{ __html: preparedValue }}
		/>
	)
}
