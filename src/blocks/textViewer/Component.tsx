import { useAvailableBeacons, useWatch } from '@inseri/lighthouse'
import { IconFileTypography } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useMemo } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import stringify from 'json-stable-stringify'
import { Box, CodeEditor, Group, Select, Text, useGlobalState } from '../../components'
import { getBodyTypeByContenType, TEXTUAL_CONTENT_TYPES } from '../../utils'
import { Attributes } from './index'
import { GlobalState } from './state'

export function TextViewerEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { input, label, blockId, blockName, isWizardMode, actions } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!input.key
	const inputBeaconKey = input.key
	const { updateState, chooseInputBeacon } = actions

	const textualContentTypes = TEXTUAL_CONTENT_TYPES.map((t) => t.value)
	const availableBeacons = useAvailableBeacons((c) => textualContentTypes.includes(c) || c.startsWith('text/'))
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	const { status } = useWatch(input)
	useEffect(() => {
		if (status === 'unavailable') {
			updateState({ input: { ...input, key: '' }, isWizardMode: true })
		}
	}, [status])

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
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconFileTypography size={28} />
						<Text ml="xs" fz={24}>
							{__('Text Editor', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Display code by selecting a block source', 'inseri-core')}
						data={selectData}
						value={inputBeaconKey}
						onChange={(key) => chooseInputBeacon(availableBeacons[key!])}
					/>
				</Box>
			) : (
				<TextViewerView renderResizable={renderResizable} />
			)}
		</>
	)
}

interface ViewProps {
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export function TextViewerView(props: ViewProps) {
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
			<Group position="left" mb={4}>
				{label.trim() && <Text fz={14}>{label}</Text>}
			</Group>
			{renderResizable ? renderResizable(editorElement) : editorElement}
		</Box>
	)
}
