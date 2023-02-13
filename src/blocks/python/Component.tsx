import { useAvailableBeacons, useControlTower, useWatch } from '@inseri/lighthouse'
import { IconBrandPython, IconChevronLeft } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Button, CodeEditor, Group, Select, Text, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState } from './state'

const textEditorBeacon = { contentType: '', description: 'content', key: 'content', default: '' }

export function PythonEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { input, output, label, mode, blockId, blockName, editable, isWizardMode, selectedMode, wizardStep, actions } = useGlobalState(
		(state: GlobalState) => state
	)
	const isValueSet = mode === 'editor' || (!!mode && input.key)
	const contentType = output.contentType
	const inputBeaconKey = input.key

	const { updateState } = actions

	const availableBeacons = useAvailableBeacons('python')
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	const beaconConfigs = mode === 'editor' ? [{ ...textEditorBeacon, contentType }] : []
	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, beaconConfigs)

	useEffect(() => {
		if (producersBeacons.length > 0 && !output.key) {
			updateState({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	const { status } = useWatch(input)
	useEffect(() => {
		if (status === 'unavailable') {
			updateState({ input: { ...input, key: '' }, isWizardMode: true, wizardStep: 1, mode: '' })
		}
	}, [status])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false, wizardStep: 0 })
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
						<ToolbarButton icon={edit} title={__('Edit', 'inseri-core')} onClick={() => updateState({ isWizardMode: !isWizardMode })} />
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
					{mode === 'editor' && (
						<PanelRow>
							<ToggleControl
								label={__('publicly editable', 'inseri-core')}
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
						<IconBrandPython size={28} />
						<Text ml="xs" fz={24}>
							{__('Python Code', 'inseri-core')}
						</Text>
					</Group>
					{wizardStep == 0 && (
						<Group mb="md" spacing={0}>
							<Button
								onClick={() => updateState({ isWizardMode: false, mode: 'editor', selectedMode: 'editor' })}
								variant="outline"
								mr="sm"
								style={{ flex: 1 }}
							>
								{__('Write Code', 'inseri-core')}
							</Button>
							<Button onClick={() => updateState({ wizardStep: 1, selectedMode: 'viewer' })} variant="outline" ml="sm" style={{ flex: 1 }}>
								{__('Load Code', 'inseri-core')}
							</Button>
						</Group>
					)}
					{selectedMode === 'viewer' && wizardStep === 1 && (
						<>
							<Select
								label={__('Display code by selecting a block source', 'inseri-core')}
								data={selectData}
								value={inputBeaconKey}
								onChange={(key) => updateState({ input: availableBeacons[key!], isWizardMode: false, mode: 'viewer' })}
								mb="lg"
							/>
							<Button
								color="gray"
								variant="outline"
								onClick={() => updateState({ wizardStep: 0 })}
								leftIcon={<IconChevronLeft size={14} />}
								styles={{ leftIcon: { marginRight: 0 } }}
							>
								{__('Back', 'inseri-core')}
							</Button>
						</>
					)}
				</Box>
			) : (
				<PythonView {...props} isGutenbergEditor renderResizable={renderResizable} />
			)}
		</>
	)
}

interface ViewProps {
	attributes: Readonly<Attributes>
	isGutenbergEditor?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export function PythonView(props: ViewProps) {
	const { isGutenbergEditor, renderResizable } = props
	const { height, editable, label, mode, input, content, pyWorker, isWorkerReady, stderr, stdout, result } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const { value, status } = useWatch(input)
	const isEditable = (editable || isGutenbergEditor) && mode === 'editor'

	stderr && console.log('stderr', stderr)
	stdout && console.log('stdout', stdout)
	result && console.log('result', result)

	const [code, setCode] = useState(content)

	let preparedValue = value

	if ((status !== 'ready' && status !== 'initial') || !preparedValue) {
		preparedValue = ''
	}

	const editorElement =
		mode === 'viewer' ? (
			<CodeEditor height={height} type={'python'} value={preparedValue} />
		) : (
			<CodeEditor
				height={height}
				type={'python'}
				value={code}
				onChange={(val) => {
					if (isEditable) {
						setCode(val)
					}
				}}
			/>
		)

	const runCode = () => {
		updateState({ stderr: '', stdout: '' })
		pyWorker.postMessage({ code })
	}

	return (
		<Box p="md">
			<Group position="apart" mb={4}>
				{label.trim() && <Text fz={14}>{label}</Text>}
				<div />

				<Button variant="subtle" onClick={runCode} disabled={!isWorkerReady}>
					{__('Run Code', 'inseri-core')}
				</Button>
			</Group>
			{renderResizable ? renderResizable(editorElement) : editorElement}
			{stderr && (
				<Text fz={14} color="red">
					{stderr}
				</Text>
			)}
		</Box>
	)
}
