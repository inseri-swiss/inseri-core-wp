import { useDebouncedValue } from '@mantine/hooks'
import { IconEye, IconPencil } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Button, CodeEditor, Group, Text, Tooltip, useGlobalState } from '../../components'
import { usePublish } from '@inseri/lighthouse-next'
import { formatCode, getBodyTypeByContenType, isBeautifyType } from '../../utils'
import { GlobalState } from './state'

interface ViewProps {
	isGutenbergEditor?: boolean
	isSelected?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View(props: ViewProps) {
	const { isGutenbergEditor, isSelected, renderResizable } = props
	const { height, editable, contentType, label, content, isVisible } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const [publishValue, publishEmpty] = usePublish('content', 'content')
	const isEditable = editable || isGutenbergEditor

	const codeType = useMemo(() => {
		return getBodyTypeByContenType(contentType) ?? 'text'
	}, [contentType])

	const [code, setCode] = useState(content)
	const [hasSyntaxError, setSyntaxError] = useState(false)
	const [debouncedCode] = useDebouncedValue(code, 500)

	const dispatchValue = (newValue: string) => {
		setSyntaxError(false)

		if (contentType.match('/json') && newValue.trim().length > 0) {
			try {
				publishValue(JSON.parse(newValue), contentType)
			} catch (error) {
				setSyntaxError(true)
				publishEmpty()
			}
		} else {
			publishValue(newValue, contentType)
		}
	}

	useEffect(() => {
		dispatchValue(content)
	}, [])

	useEffect(() => {
		dispatchValue(debouncedCode)

		if (isGutenbergEditor) {
			updateState({ content: debouncedCode })
		}
	}, [debouncedCode])

	const editorElement = (
		<CodeEditor
			height={height}
			type={codeType}
			value={code}
			onChange={(val) => {
				if (isEditable) {
					setCode(val)
				}
			}}
		/>
	)

	const beautify = () => {
		const [errorMsg, formattedCode] = formatCode(codeType, code)
		setSyntaxError(!!errorMsg)

		if (formattedCode) {
			setCode(formattedCode)
		}
	}

	return isVisible || isSelected ? (
		<Box p="md">
			<Group spacing="xs" mb={4}>
				{label.trim() && <Text fz={14}>{label}</Text>}
				<div style={{ flex: 1 }} />
				{editable ? (
					<Tooltip label={__('editable', 'inseri-core')}>
						<Group>
							<IconPencil size={22} />
						</Group>
					</Tooltip>
				) : (
					<Tooltip label={__('read-only', 'inseri-core')}>
						<Group>
							<IconEye size={22} />
						</Group>
					</Tooltip>
				)}
				{isBeautifyType(codeType) && isEditable && (
					<Button variant="subtle" onClick={beautify}>
						{__('Beautify', 'inseri-core')}
					</Button>
				)}
			</Group>
			{renderResizable ? renderResizable(editorElement) : editorElement}
			{hasSyntaxError && (
				<Text fz={14} color="red">
					{__('It has syntax error!', 'inseri-core')}
				</Text>
			)}
		</Box>
	) : isGutenbergEditor ? (
		<Box
			style={{
				height: height + 36 /* button */ + 32 /* padding */ + 4 /* marginBottom of button*/,
				border: '1px dashed currentcolor',
				borderRadius: '2px',
			}}
		>
			<Box />
			<svg width="100%" height="100%">
				<line strokeDasharray="3" x1="0" y1="0" x2="100%" y2="100%" style={{ stroke: 'currentColor' }} />
			</svg>
		</Box>
	) : (
		<div />
	)
}
