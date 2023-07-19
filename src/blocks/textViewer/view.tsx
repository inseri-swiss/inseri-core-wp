import { useWatch } from '@inseri/lighthouse-next'
import { IconEye } from '@tabler/icons-react'
import { useMemo } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import stringify from 'json-stable-stringify'
import { Box, CodeEditor, Group, Text, Tooltip, useGlobalState } from '../../components'
import { getBodyTypeByContenType } from '../../utils'
import { GlobalState } from './state'

interface ViewProps {
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View(props: ViewProps) {
	const { renderResizable } = props
	const { height, label, inputKey } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const valueWrapper = useWatch(inputKey, () => updateState({ inputKey: '', isWizardMode: true }))

	let incomingContentType = ''
	let preparedValue = ''

	if (valueWrapper.type === 'wrapper') {
		incomingContentType = valueWrapper.contentType
		preparedValue = valueWrapper.value

		if (incomingContentType.match('/json')) {
			preparedValue = stringify(valueWrapper.value)
		}
	}

	const codeType = useMemo(() => {
		return getBodyTypeByContenType(incomingContentType) ?? 'text'
	}, [incomingContentType])

	const editorElement = <CodeEditor height={height} type={codeType} value={preparedValue} />

	return (
		<Box p="md">
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
		</Box>
	)
}
