import { useAvailableBeacons, useControlTower, useDispatchMany, useWatch, useWatchMany } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { IconBrandPython, IconChevronLeft } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { Button as WPButton, PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit, external } from '@wordpress/icons'
import { Box, Button, CodeEditor, Group, Select, Text, useGlobalState } from '../../components'
import config from './block.json'
import { ExtendedView } from './ExtendedView'
import { Attributes } from './index'
import { GlobalState } from './state'
import { TopBar } from './TopBar'
import { Action } from './WorkerActions'

export function PythonEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputCode, label, mode, blockId, blockName, editable, isWizardMode, selectedMode, wizardStep, actions, isModalOpen, isVisible, autoTrigger } =
		useGlobalState((state: GlobalState) => state)
	const { updateState } = actions
	const isValueSet = mode === 'editor' || (!!mode && inputCode.key)
	const inputBeaconKey = inputCode.key

	const availableBeacons = useAvailableBeacons('python')
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	const { status } = useWatch(inputCode)
	useEffect(() => {
		if (status === 'unavailable') {
			updateState({ input: { ...inputCode, key: '' }, isWizardMode: true, wizardStep: 1, mode: '' })
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
			<ExtendedView />
			<BlockControls>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton icon={edit} title={__('Edit', 'inseri-core')} onClick={() => updateState({ isWizardMode: !isWizardMode })} />
						<ToolbarButton
							icon={external}
							title={__('Open extended view', 'inseri-core')}
							onClick={() => {
								updateState({ isModalOpen: !isModalOpen })
							}}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<Box mb="sm">
							<WPButton icon={external} variant="primary" onClick={() => updateState({ isModalOpen: true })}>
								{__('Open extended view', 'inseri-core')}
							</WPButton>
						</Box>
					</PanelRow>
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
									updateState({ autoTrigger: true })
								}
							}}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Execute automatically', 'inseri-core')}
							help={
								autoTrigger
									? __('Code is executed initially and on changes of inputs.', 'inseri-core')
									: __('Code needs to be executed manually.', 'inseri-core')
							}
							checked={autoTrigger}
							onChange={(newTriggerState) => {
								if (isVisible) {
									updateState({ autoTrigger: newTriggerState })
								}
							}}
						/>
					</PanelRow>
					{mode === 'editor' && isVisible && (
						<PanelRow>
							<ToggleControl
								label={__('publicly editable', 'inseri-core')}
								help={editable ? __('Code is editable by anyone.', 'inseri-core') : __('Code cannot be modified by anyone.', 'inseri-core')}
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
					{wizardStep === 0 && (
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
								onChange={(key) => updateState({ inputCode: availableBeacons[key!], isWizardMode: false, mode: 'viewer' })}
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
				<PythonView {...props} isGutenbergEditor renderResizable={renderResizable} isSelected={isSelected} />
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

export function PythonView(props: ViewProps) {
	const { isGutenbergEditor, isSelected, renderResizable } = props
	const { height, editable, mode, inputCode, content, inputs, pyWorker, blockId, blockName, outputs, isVisible, autoTrigger, workerStatus } = useGlobalState(
		(state: GlobalState) => state
	)
	const { updateState, runCode } = useGlobalState((state: GlobalState) => state.actions)
	const isEditable = (editable || isGutenbergEditor) && mode === 'editor'
	const prevWorkerStatus = usePrevious(workerStatus)

	const { value, status } = useWatch(inputCode)
	const watchedValues = useWatchMany(inputs)
	const watchedValuesIndicator = Object.values(watchedValues).reduce((acc, item) => acc + (item ? JSON.stringify(item).length : 0), 0)
	const areWatchedValuesReady = Object.values(watchedValues).reduce((acc, item) => acc && item.status === 'ready', true)
	const joinedOutputKeys = outputs.map((o) => o.description).join('')
	const areOutputsReady = outputs.every((o) => o.contentType !== '')

	useEffect(() => {
		if (!areWatchedValuesReady) {
			updateState({ blockerr: 'Inputs are not ready' })
		} else if (!areOutputsReady) {
			updateState({ blockerr: 'Content type is not set for all outputs' })
		} else {
			updateState({ blockerr: '' })
		}
	}, [areWatchedValuesReady, areOutputsReady])

	useEffect(() => {
		if (areWatchedValuesReady) {
			const watchedInputs = Object.entries(watchedValues).reduce((acc, [variable, watched]) => {
				acc[variable] = watched.value
				return acc
			}, {} as any)

			setTimeout(() => pyWorker.postMessage({ type: 'SET_INPUTS', payload: watchedInputs }), 10000)
		}
	}, [watchedValuesIndicator, areWatchedValuesReady])

	useEffect(() => {
		pyWorker.postMessage({ type: 'SET_OUTPUTS', payload: outputs.map((o) => o.description) })
	}, [joinedOutputKeys])

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, outputs)
	const joinedOutputTypes = outputs.map((o) => o.contentType).join('')
	const joinedKeys = outputs.reduce((acc, b) => acc + b.key, '')

	useEffect(() => {
		updateState({ outputs: producersBeacons })
	}, [producersBeacons.length, joinedKeys])

	const dispatchRecord = useDispatchMany(producersBeacons)

	useEffect(() => {
		outputs.forEach((o) => {
			dispatchRecord[o.description]({ contentType: o.contentType })
		})
	}, [joinedOutputTypes])

	pyWorker.addEventListener('message', ({ data }: MessageEvent<Action>) => {
		if (data.type === 'SET_RESULTS') {
			Object.entries(data.payload).forEach(([key, val]) => {
				let convertedData = val

				if (convertedData instanceof Uint8Array) {
					const found = outputs.find((o) => o.description === key)
					convertedData = new Blob([convertedData.buffer], { type: found!.contentType })
				}

				dispatchRecord[key]({ status: 'ready', value: val })
			})
		}
	})

	let preparedValue = value

	if ((status !== 'ready' && status !== 'initial') || !preparedValue) {
		preparedValue = ''
	}

	const code = mode === 'viewer' ? preparedValue : content

	// must be the last useEffect
	useEffect(() => {
		if (autoTrigger && areWatchedValuesReady && areOutputsReady && workerStatus === 'ready' && prevWorkerStatus !== 'in-progress') {
			runCode(code)
		}
	}, [
		areWatchedValuesReady,
		areOutputsReady,
		watchedValuesIndicator,
		content,
		workerStatus,
	])

	const editorElement = (
		<CodeEditor
			height={height}
			type={'python'}
			value={code}
			onChange={(val) => {
				if (isEditable && mode === 'editor') {
					updateState({ content: val })
				}
			}}
		/>
	)

	return isVisible || isSelected ? (
		<Box p="md">
			<Group position="apart" mb={4} pl="sm" spacing="xs">
				<TopBar code={code} />
			</Group>
			{renderResizable ? renderResizable(editorElement) : editorElement}
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
