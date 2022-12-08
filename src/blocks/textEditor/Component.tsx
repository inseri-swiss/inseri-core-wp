import { useControlTower, useDispatch } from '@inseri/lighthouse'
import { useDebouncedValue } from '@mantine/hooks'
import { IconCode } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarGroup } from '@wordpress/components'
import { useEffect, useMemo, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, CodeEditor, Group, Select, Text } from '../../components'
import config from './block.json'
import { Attributes } from './index'

import { getBodyTypeByContenType, TEXTUAL_CONTENT_TYPES } from '../../utils'

const textEditorBeacon = { contentType: '', description: __('content', 'inseri-core'), key: 'content', default: '' }

export function TextEditorEdit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, isSelected } = props
	const { blockId, blockName, editable, output, label } = attributes

	const [contentType, setContentType] = useState(output?.contentType ?? '')
	const [isWizardMode, setWizardMode] = useState(!contentType)
	const dispatch = useDispatch(output)

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, [textEditorBeacon])

	useEffect(() => {
		if (producersBeacons.length > 0) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		dispatch({ contentType })

		if (output) {
			const newOutput = { ...output, contentType }
			setAttributes({ output: newOutput })
		}
	}, [contentType])

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			enable={{ bottom: true }}
			minHeight={150}
			onResize={(_event, _direction, element) => {
				setAttributes({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

	useEffect(() => {
		if (contentType && !isSelected && isWizardMode) {
			setWizardMode(false)
		}
	}, [isSelected])

	const toolbarControls = [
		{
			icon: edit,
			isActive: isWizardMode,
			onClick: () => setWizardMode(!isWizardMode),
			title: __('Edit', 'inseri-core'),
		},
	]

	return (
		<>
			<BlockControls>{contentType && <ToolbarGroup controls={toolbarControls} />}</BlockControls>

			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => setAttributes({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => setAttributes({ label: value })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl label="Editable to public" checked={editable} onChange={() => setAttributes({ editable: !editable })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="lg" spacing={0}>
						<IconCode size={28} />
						<Text ml="xs" fz={24}>
							{__('Text Editor', 'inseri-core')}
						</Text>
					</Group>
					<Select label="Choose a format" mb="md" searchable data={TEXTUAL_CONTENT_TYPES} value={contentType} onChange={(v) => setContentType(v!)} />
				</Box>
			) : (
				<TextEditorView {...props} setAttributes={setAttributes} renderResizable={renderResizable} />
			)}
		</>
	)
}

interface ViewProps {
	attributes: Readonly<Attributes>
	setAttributes?: (attrs: Partial<Attributes>) => void
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export function TextEditorView(props: ViewProps) {
	const { attributes, setAttributes, renderResizable } = props
	const { height, editable, output, label } = attributes

	const dispatch = useDispatch(output)

	const isEditorMode = !!setAttributes
	const isEditable = editable || isEditorMode

	const codeType = useMemo(() => {
		return getBodyTypeByContenType(output?.contentType) ?? 'text'
	}, [output?.contentType])

	const [code, setCode] = useState(attributes.content)
	const [debouncedCode] = useDebouncedValue(code, 500)

	const dispatchValue = (value: string) => {
		if (output?.contentType.match('/json')) {
			try {
				dispatch({ value: JSON.parse(value), status: 'ready' })
			} catch (error) {
				dispatch({ status: 'error' })
			}
		} else {
			dispatch({ value, status: 'ready' })
		}
	}

	useEffect(() => {
		dispatchValue(attributes.content)
	}, [])

	useEffect(() => {
		dispatchValue(debouncedCode)

		if (isEditorMode) {
			setAttributes({ content: debouncedCode })
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

	return (
		<Box p="md">
			{label.trim() && <Text fz={14}>{label}</Text>}
			{renderResizable ? renderResizable(editorElement) : editorElement}
		</Box>
	)
}
