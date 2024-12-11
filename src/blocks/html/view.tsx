import { useWatch, Nucleus } from '@inseri/lighthouse'
import { IconCircleOff } from '@tabler/icons-react'
import { __ } from '@wordpress/i18n'
import { Box, CodeEditor, Group, Text, createStyles } from '../../components'
import { useGlobalState } from '../../components/StateProvider'
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
	const { inputKey, mode } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const { isEmpty, altText, value } = useWatch(inputKey, {
		onBlockRemoved: () => updateState({ inputKey: '', isWizardMode: true }),
		onNone: () => ({ isEmpty: true, altText: 'No HTML code is set', value: '' }),
		onSome: (nucleus: Nucleus<string>) => {
			if (!nucleus.contentType.includes('html')) {
				return { isEmpty: true, altText: `This content-type ${nucleus.contentType} is not supported`, value: '' }
			}

			return { isEmpty: false, altText: '', value: nucleus.value }
		},
	})
	const { wrapper } = useViewStyles().classes

	return mode === 'code' ? (
		<Box>
			<CodeEditor type={'html'} value={value} />
		</Box>
	) : isEmpty ? (
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
			dangerouslySetInnerHTML={{ __html: value }}
		/>
	)
}
