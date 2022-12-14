import { useAvailableBeacons, useControlTower, useDispatch, useWatch } from '@inseri/lighthouse'
import { useDebouncedValue, usePrevious } from '@mantine/hooks'
import { IconCode } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarGroup } from '@wordpress/components'
import { useEffect, useMemo, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Button, CodeEditor, Group, SegmentedControl, Select, Text } from '../../components'
import { formatCode, getBodyTypeByContenType, isBeautifyType, TEXTUAL_CONTENT_TYPES } from '../../utils'
import config from './block.json'
import { Attributes } from './index'
import stringify from 'json-stable-stringify'

const textEditorBeacon = { contentType: '', description: __('content', 'inseri-core'), key: 'content', default: '' }

export function TextEditorEdit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, isSelected } = props
	const { blockId, blockName, editable, input, output, label, mode } = attributes

	const isValueSet = !!output?.contentType || !!input

	const [contentType, setContentType] = useState(output?.contentType ?? '')
	const prevContentType = usePrevious(contentType)
	const [isWizardMode, setWizardMode] = useState(!isValueSet)

	const [selectedTab, setSelectedTab] = useState<'editor' | 'viewer'>(mode)
	const [inputBeaconKey, setInputBeaconKey] = useState(input?.key ?? '')

	const textualContentTypes = TEXTUAL_CONTENT_TYPES.map((t) => t.value)
	const availableBeacons = useAvailableBeacons((c) => textualContentTypes.includes(c))
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	const beaconConfigs = mode === 'editor' ? [{ ...textEditorBeacon, contentType }] : []
	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, beaconConfigs)
	const dispatch = useDispatch(output)

	useEffect(() => {
		if (producersBeacons.length > 0 && !output) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (prevContentType && prevContentType !== contentType) {
			dispatch({ status: 'unavailable' })

			setTimeout(() => dispatch({ contentType, status: 'initial' }), 100)
		}
	}, [contentType])

	const { status } = useWatch(input)
	useEffect(() => {
		if (status === 'unavailable') {
			setAttributes({ input: undefined })
			setInputBeaconKey('')
			setWizardMode(true)
		}
	}, [status])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			setSelectedTab(mode)
			setWizardMode(false)
		}
	}, [isSelected])

	const setContenTypeAction = (newContentType: string) => {
		setWizardMode(false)
		setContentType(newContentType)

		if (output) {
			const newOutput = { ...output, contentType: newContentType }
			setAttributes({ output: newOutput })
		}

		setAttributes({ mode: 'editor', input: undefined })
		setInputBeaconKey('')
	}

	const chooseInputBeacon = (key: string) => {
		setWizardMode(false)
		setInputBeaconKey(key!)

		setAttributes({ input: availableBeacons[key!], mode: 'viewer' })
		setContentType('')
	}

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			enable={{ bottom: true }}
			minHeight={60}
			onResize={(_event, _direction, element) => {
				setAttributes({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

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
			<BlockControls>{isValueSet && <ToolbarGroup controls={toolbarControls} />}</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => setAttributes({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => setAttributes({ label: value })} />
					</PanelRow>
					{mode === 'editor' && (
						<PanelRow>
							<ToggleControl
								label={__('publicly editable', 'inseri-core')}
								checked={editable}
								onChange={() => {
									setAttributes({ editable: !editable })
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
						onChange={(v: any) => setSelectedTab(v)}
						data={['Editor', 'Viewer'].map((s) => ({ label: s, value: s.toLowerCase() }))}
					/>
					{selectedTab === 'editor' && (
						<Select
							label={__('Choose a format', 'inseri-core')}
							mb="md"
							searchable
							data={TEXTUAL_CONTENT_TYPES}
							value={contentType}
							onChange={setContenTypeAction}
						/>
					)}
					{selectedTab === 'viewer' && (
						<Select
							label={__('Display code by selecting a block source', 'inseri-core')}
							data={selectData}
							value={inputBeaconKey}
							onChange={chooseInputBeacon}
						/>
					)}
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
	const { height, editable, output, label, mode, input } = attributes

	const dispatch = useDispatch(output)
	const { contentType: incomingContentType, value, status } = useWatch(input)

	const isGutenbergEditor = !!setAttributes
	const isEditable = (editable || isGutenbergEditor) && mode === 'editor'

	const codeType = useMemo(() => {
		if (mode === 'viewer') {
			return getBodyTypeByContenType(incomingContentType) ?? 'text'
		}

		return getBodyTypeByContenType(output?.contentType) ?? 'text'
	}, [output?.contentType, mode, incomingContentType])

	const [code, setCode] = useState(attributes.content)
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
		dispatchValue(attributes.content)
	}, [])

	useEffect(() => {
		dispatchValue(debouncedCode)

		if (isGutenbergEditor) {
			setAttributes({ content: debouncedCode })
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

	return (
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
	)
}
