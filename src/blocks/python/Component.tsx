import { dispatch, useAvailableBeacons, useControlTower, useDispatchMany, useWatch, useWatchMany } from '@inseri/lighthouse'
import { IconBrandPython, IconChevronLeft } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
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

	const { inputCode, label, mode, blockId, blockName, editable, isWizardMode, selectedMode, wizardStep, actions, isModalOpen } = useGlobalState(
		(state: GlobalState) => state
	)
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
	const { height, editable, mode, inputCode, content, stderr, inputs, blockerr, pyWorker, blockId, blockName, outputs } = useGlobalState(
		(state: GlobalState) => state
	)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const isEditable = (editable || isGutenbergEditor) && mode === 'editor'

	const { value, status } = useWatch(inputCode)
	const watchedValues = useWatchMany(inputs)
	const watchedValuesIndicator = Object.values(watchedValues).reduce((acc, item) => acc + (item ? JSON.stringify(item).length : 0), 0)
	const areWatchedValuesReady = Object.values(watchedValues).reduce((acc, item) => acc && item.status === 'ready', true)

	useEffect(() => {
		if (!areWatchedValuesReady) {
			updateState({ blockerr: 'Inputs are not ready' })
			return
		}

		updateState({ blockerr: '' })

		const watchedInputs = Object.entries(watchedValues).reduce((acc, [variable, watched]) => {
			acc[variable] = watched.value
			return acc
		}, {} as any)

		pyWorker.postMessage({ type: 'SET_INPUTS', payload: watchedInputs })
	}, [watchedValuesIndicator, areWatchedValuesReady])

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, outputs)
	const joinedKeys = outputs.reduce((acc, b) => acc + b.key, '')

	useEffect(() => {
		updateState({ outputs: producersBeacons })
	}, [producersBeacons.length, joinedKeys])

	const dispatchRecord = useDispatchMany(producersBeacons)

	pyWorker.addEventListener('message', ({ data }: MessageEvent<Action>) => {
		if (data.type === 'SET_OUTPUT') {
			const key = data.key
			if (dispatchRecord[key]) {
				dispatchRecord[key]({ status: 'ready', value: data.payload })
			} else {
				dispatch(`${blockId}/${key}`, { status: 'ready', value: data.payload }, { contentType: 'application/json', description: '', key: '' })
				updateState({ outputs: outputs.concat({ contentType: 'application/json', description: key, key }) })
			}
		}
	})

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
				value={content}
				onChange={(val) => {
					if (isEditable) {
						updateState({ content: val })
					}
				}}
			/>
		)

	return (
		<Box p="md">
			<Group position="apart" mb={4} pl="sm" spacing="xs">
				<TopBar />
			</Group>
			{renderResizable ? renderResizable(editorElement) : editorElement}
			{(blockerr || stderr) && (
				<Text fz={14} color="red">
					{blockerr || stderr}
				</Text>
			)}
		</Box>
	)
}
