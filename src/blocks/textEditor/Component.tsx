import { useAvailableBeacons, useControlTower, useDispatch, useWatch } from '@inseri/lighthouse'
import { useDebouncedValue } from '@mantine/hooks'
import { IconCode } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarGroup } from '@wordpress/components'
import { useEffect, useMemo, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import stringify from 'json-stable-stringify'
import { Box, Button, CodeEditor, Group, SegmentedControl, Select, Text, useGlobalState } from '../../components'
import { formatCode, getBodyTypeByContenType, isBeautifyType, TEXTUAL_CONTENT_TYPES } from '../../utils'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState } from './state'

const textEditorBeacon = { contentType: '', description: 'content', key: 'content', default: '' }

export function TextEditorEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { input, output, label, mode, blockId, blockName, editable, isWizardMode, prevContentType, selectedTab, actions, isVisible } = useGlobalState(
		(state: GlobalState) => state
	)
	const isValueSet = !!output.contentType || !!input.key
	const contentType = output.contentType
	const inputBeaconKey = input.key
	const outputBeacon = output.key ? output : undefined

	const { updateState, setContentType, chooseInputBeacon } = actions

	const textualContentTypes = TEXTUAL_CONTENT_TYPES.map((t) => t.value)
	const availableBeacons = useAvailableBeacons((c) => textualContentTypes.includes(c) || c.startsWith('text/'))
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	const beaconConfigs = mode === 'editor' ? [{ ...textEditorBeacon, contentType }] : []
	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, beaconConfigs)
	const dispatch = useDispatch(outputBeacon)

	const editableHelpText = editable ? __('Visitors can change the content', 'inseri-core') : __('Visitors cannot change the content.', 'inseri-core')

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

	const { status } = useWatch(input)
	useEffect(() => {
		if (status === 'unavailable') {
			updateState({ input: { ...input, key: '' }, isWizardMode: true })
		}
	}, [status])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ selectedTab: mode, isWizardMode: false })
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

	const toolbarControls = [
		{
			icon: edit,
			isActive: isWizardMode,
			onClick: () => updateState({ isWizardMode: !isWizardMode }),
			title: __('Edit', 'inseri-core'),
		},
	]

	return (
		<>
			<BlockControls>{isValueSet && <ToolbarGroup controls={toolbarControls} />}</BlockControls>
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
					{mode === 'editor' && (
						<PanelRow>
							<ToggleControl
								label={__('publicly editable', 'inseri-core')}
								help={editableHelpText}
								checked={editable}
								onChange={() => {
									updateState({ editable: !editable })
								}}
							/>
						</PanelRow>
					)}
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconCode size={28} />
						<Text ml="xs" fz={24}>
							{__('Text Editor', 'inseri-core')}
						</Text>
					</Group>
					<SegmentedControl
						my="md"
						value={selectedTab}
						onChange={(v: any) => updateState({ selectedTab: v })}
						data={['Editor', 'Viewer'].map((s) => ({ label: s, value: s.toLowerCase() }))}
					/>
					{selectedTab === 'editor' && (
						<Select
							label={__('Choose a format', 'inseri-core')}
							mb="md"
							searchable
							data={TEXTUAL_CONTENT_TYPES}
							value={contentType}
							onChange={setContentType}
						/>
					)}
					{selectedTab === 'viewer' && (
						<Select
							label={__('Display code by selecting a block source', 'inseri-core')}
							data={selectData}
							value={inputBeaconKey}
							onChange={(key) => chooseInputBeacon(availableBeacons[key!])}
						/>
					)}
				</Box>
			) : (
				<TextEditorView {...props} isGutenbergEditor isSelected={isSelected} renderResizable={renderResizable} />
			)}
		</>
	)
}

interface ViewProps {
	attributes: Readonly<Attributes>
	isGutenbergEditor?: boolean
	isSelected?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export function TextEditorView(props: ViewProps) {
	const { isGutenbergEditor, isSelected, renderResizable } = props
	const { height, editable, output, label, mode, input, content, isVisible } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const dispatch = useDispatch(output)
	const { contentType: incomingContentType, value, status } = useWatch(input)
	const isEditable = (editable || isGutenbergEditor) && mode === 'editor'

	const codeType = useMemo(() => {
		if (mode === 'viewer') {
			return getBodyTypeByContenType(incomingContentType) ?? 'text'
		}

		return getBodyTypeByContenType(output.contentType) ?? 'text'
	}, [output.contentType, mode, incomingContentType])

	const [code, setCode] = useState(content)
	const [hasSyntaxError, setSyntaxError] = useState(false)
	const [debouncedCode] = useDebouncedValue(code, 500)

	const dispatchValue = (newValue: string) => {
		setSyntaxError(false)

		if (output?.contentType.match('/json')) {
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

	let preparedValue = value

	if (incomingContentType.match('/json') && preparedValue) {
		preparedValue = stringify(value)
	}

	if ((status !== 'ready' && status !== 'initial') || !preparedValue) {
		preparedValue = ''
	}

	const editorElement =
		mode === 'viewer' ? (
			<CodeEditor height={height} type={codeType} value={preparedValue} />
		) : (
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
