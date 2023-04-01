import { useControlTower, useDispatch } from '@inseri/lighthouse'
import { useDebouncedValue } from '@mantine/hooks'
import { IconEdit } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useMemo, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Button, CodeEditor, Group, Select, Text, useGlobalState } from '../../components'
import { formatCode, getBodyTypeByContenType, isBeautifyType, TEXTUAL_CONTENT_TYPES } from '../../utils'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState } from './state'

const textEditorBeacon = { contentType: '', description: 'content', key: 'content', default: '' }

export function TextEditorEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { output, label, blockId, blockName, editable, isWizardMode, prevContentType, actions, isVisible } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!output.contentType
	const contentType = output.contentType
	const outputBeacon = output.key ? output : undefined

	const { updateState, setContentType } = actions

	const beaconConfigs = [{ ...textEditorBeacon, contentType }]
	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, beaconConfigs)
	const dispatch = useDispatch(outputBeacon)

	const editableHelpText = editable ? __('Visitors can change the content.', 'inseri-core') : __('Visitors cannot change the content.', 'inseri-core')

	useEffect(() => {
		if (producersBeacons.length > 0 && !output.key) {
			updateState({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (prevContentType !== contentType) {
			dispatch({ status: 'unavailable' })

			setTimeout(() => dispatch({ contentType, status: 'initial' }), 100)
		}
	}, [contentType])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			showHandle={isSelected}
			enable={{ bottom: true }}
			minHeight={60}
			onResize={(_event, _direction, element) => {
				updateState({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

	return (
		<>
			<BlockControls>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton
							icon={edit}
							title={__('Edit', 'inseri-core')}
							isActive={isWizardMode}
							onClick={() => {
								updateState({ isWizardMode: !isWizardMode })
							}}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Show block', 'inseri-core')}
							help={isVisible ? __('Block is visible.', 'inseri-core') : __('Block is invisible.', 'inseri-core')}
							checked={isVisible}
							onChange={(newVisibility) => {
								updateState({ isVisible: newVisibility })
								if (!newVisibility) {
									updateState({ editable: false })
								}
							}}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('publicly editable', 'inseri-core')}
							help={editableHelpText}
							checked={editable}
							onChange={() => {
								if (isVisible) {
									updateState({ editable: !editable })
								}
							}}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconEdit size={28} />
						<Text ml="xs" fz={24}>
							{__('Text Editor', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Choose a format', 'inseri-core')}
						mb="md"
						searchable
						data={TEXTUAL_CONTENT_TYPES}
						value={contentType}
						onChange={(v) => setContentType(v ?? '')}
					/>
				</Box>
			) : (
				<TextEditorView isGutenbergEditor isSelected={isSelected} renderResizable={renderResizable} />
			)}
		</>
	)
}

interface ViewProps {
	isGutenbergEditor?: boolean
	isSelected?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export function TextEditorView(props: ViewProps) {
	const { isGutenbergEditor, isSelected, renderResizable } = props
	const { height, editable, output, label, content, isVisible } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const dispatch = useDispatch(output)
	const isEditable = editable || isGutenbergEditor

	const codeType = useMemo(() => {
		return getBodyTypeByContenType(output.contentType) ?? 'text'
	}, [output.contentType])

	const [code, setCode] = useState(content)
	const [hasSyntaxError, setSyntaxError] = useState(false)
	const [debouncedCode] = useDebouncedValue(code, 500)

	const dispatchValue = (newValue: string) => {
		setSyntaxError(false)

		if (output?.contentType.match('/json') && newValue.trim().length > 0) {
			try {
				dispatch({ value: JSON.parse(newValue), status: 'ready' })
			} catch (error) {
				setSyntaxError(true)
				dispatch({ status: 'error' })
			}
		} else {
			dispatch({ value: newValue, status: 'ready' })
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
			<Group position="apart" mb={4}>
				{label.trim() && <Text fz={14}>{label}</Text>}
				<div />
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
