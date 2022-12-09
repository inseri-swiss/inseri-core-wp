import { useAvailableBeacons, useControlTower, useDispatch, useWatch } from '@inseri/lighthouse'
import { useDebouncedValue } from '@mantine/hooks'
import { IconCode } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarGroup } from '@wordpress/components'
import { useEffect, useMemo, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Button, CodeEditor, Group, SegmentedControl, Select, Text } from '../../components'
import config from './block.json'
import { Attributes } from './index'

import { formatCode, getBodyTypeByContenType, isBeautifyType, TEXTUAL_CONTENT_TYPES } from '../../utils'

const textEditorBeacon = { contentType: '', description: __('content', 'inseri-core'), key: 'content', default: '' }

export function TextEditorEdit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, isSelected } = props
	const { blockId, blockName, editable, input, output, label, isViewer } = attributes

	const [contentType, setContentType] = useState(output?.contentType ?? '')
	const [isWizardMode, setWizardMode] = useState(!contentType && !output)

	const [isInternalViewer, setInternalViewer] = useState(isViewer)
	const [inputBeaconKey, setInputBeaconKey] = useState(input?.key ?? '')

	const textualContentTypes = TEXTUAL_CONTENT_TYPES.map((t) => t.value)
	const availableBeacons = useAvailableBeacons((c) => textualContentTypes.includes(c))
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	const beaconConfigs = isViewer ? [] : [textEditorBeacon]
	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, beaconConfigs)

	const dispatch = useDispatch(output)
	const isValueSet = !!contentType || !!input

	useEffect(() => {
		if (producersBeacons.length > 0) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		dispatch({ contentType, status: 'initial' })

		if (output) {
			const newOutput = { ...output, contentType }
			setAttributes({ output: newOutput })
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

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			setInternalViewer(isViewer)
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
			<BlockControls>{isValueSet && <ToolbarGroup controls={toolbarControls} />}</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => setAttributes({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => setAttributes({ label: value })} />
					</PanelRow>
					{!isViewer && (
						<PanelRow>
							<ToggleControl label="publicly editable" checked={editable} onChange={() => setAttributes({ editable: !editable })} />
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
						value={isInternalViewer ? 'Viewer' : 'Editor'}
						onChange={(v) => setInternalViewer(v === 'Viewer')}
						data={['Editor', 'Viewer']}
					/>
					{!isInternalViewer && (
						<Select
							label="Choose a format"
							mb="md"
							searchable
							data={TEXTUAL_CONTENT_TYPES}
							value={contentType}
							onChange={(v) => {
								setContentType(v!)
								setWizardMode(false)

								if (v !== contentType) {
									dispatch({ status: 'unavailable' })
								}

								setAttributes({ isViewer: isInternalViewer })
								setInputBeaconKey('')
								setAttributes({ input: undefined })
							}}
						/>
					)}
					{isInternalViewer && (
						<Select
							label={__('Display code by selecting a block source', 'inseri-core')}
							data={selectData}
							value={inputBeaconKey}
							onChange={(key) => {
								setInputBeaconKey(key!)
								setAttributes({ input: availableBeacons[key!] })
								setWizardMode(false)

								setAttributes({ isViewer: isInternalViewer })
								setContentType('')
							}}
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
	const { height, editable, output, label, isViewer, input } = attributes

	const dispatch = useDispatch(output)
	const { contentType: incomingContentType, value, status } = useWatch(input)

	const isGutenbergEditor = !!setAttributes
	const isEditable = editable || isGutenbergEditor

	const codeType = useMemo(() => {
		if (isViewer) {
			return getBodyTypeByContenType(incomingContentType) ?? 'text'
		}

		return getBodyTypeByContenType(output?.contentType) ?? 'text'
	}, [output?.contentType, isViewer, incomingContentType])

	const [code, setCode] = useState(attributes.content)
	const [hasSyntaxError, setSyntaxError] = useState(false)
	const [debouncedCode] = useDebouncedValue(code, 500)

	const dispatchValue = (value: string) => {
		setSyntaxError(false)

		if (output?.contentType.match('/json')) {
			try {
				dispatch({ value: JSON.parse(value), status: 'ready' })
			} catch (error) {
				setSyntaxError(true)
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

		if (isGutenbergEditor) {
			setAttributes({ content: debouncedCode })
		}
	}, [debouncedCode])

	useEffect(() => {
		dispatchValue(code)
	}, [output?.contentType])

	const editorElement = isViewer ? (
		<CodeEditor height={height} type={codeType} value={status === 'ready' ? value : ''} />
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
				{isBeautifyType(codeType) && isEditable && !isViewer && (
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
