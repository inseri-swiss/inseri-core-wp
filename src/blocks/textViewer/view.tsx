import { useWatch } from '@inseri/lighthouse'
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
	const { height, label, input } = useGlobalState((state: GlobalState) => state)
	const { contentType: incomingContentType, value, status } = useWatch(input)

	const codeType = useMemo(() => {
		return getBodyTypeByContenType(incomingContentType) ?? 'text'
	}, [incomingContentType])

	let preparedValue = value

	if (incomingContentType.match('/json') && preparedValue) {
		preparedValue = stringify(value)
	}

	if ((status !== 'ready' && status !== 'initial') || !preparedValue) {
		preparedValue = ''
	}

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
