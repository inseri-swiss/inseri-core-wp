import { Nucleus, useWatch } from '@inseri/lighthouse'
import { IconEye } from '@tabler/icons-react'
import { __ } from '@wordpress/i18n'
import stringify from 'json-stable-stringify'
import { Box, CodeEditor, Group, Text, Tooltip } from '../../components'
import { useGlobalState } from '../../components/StateProvider'
import { TEXTUAL_CONTENT_TYPES, getBodyTypeByContenType } from '../../utils'
import { GlobalState } from './state'

const textualContentTypes = TEXTUAL_CONTENT_TYPES.map((t) => t.value)
const isTextualContentType = (c: string) => textualContentTypes.includes(c.split(';')[0]) || c.startsWith('text/')

interface ViewProps {
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View(props: ViewProps) {
	const { renderResizable } = props
	const { height, label, inputKey } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const { value, codeType, hasError } = useWatch(inputKey, {
		onNone: () => ({ value: '', codeType: 'text', hasError: false }),
		onSome: (nucleus: Nucleus<string>) => {
			const type = getBodyTypeByContenType(nucleus.contentType) ?? 'text'

			if (nucleus.contentType.match('/json')) {
				return { value: stringify(nucleus.value), codeType: type, hasError: false }
			}

			if (isTextualContentType(nucleus.contentType) && typeof nucleus.value === 'string') {
				return { value: nucleus.value, codeType: type, hasError: false }
			}

			return { value: '', codeType: type, hasError: true }
		},
		onBlockRemoved: () => updateState({ inputKey: '', isWizardMode: true }),
	})

	const editorElement = <CodeEditor height={height} type={codeType} value={value} />

	return (
		<Box>
			<Group spacing="xs" mb={4}>
				{label.trim() && <Text fz={14}>{label}</Text>}
				<div style={{ flex: 1 }} />
				<Tooltip label={__('read-only', 'inseri-core')}>
					<Group>
						<IconEye size={22} />
					</Group>
				</Tooltip>
			</Group>
			{renderResizable ? renderResizable(editorElement) : editorElement}
			{hasError && (
				<Text fz={14} color="red">
					{__('The content type is not supported.', 'inseri-core')}
				</Text>
			)}
		</Box>
	)
}
