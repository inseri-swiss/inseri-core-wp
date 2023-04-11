import { useAvailableBeacons, useWatch } from '@inseri/lighthouse'
import { useHotkeys } from '@mantine/hooks'
import { IconChevronDown, IconChevronRight, IconChevronUp, IconPlus, IconX } from '@tabler/icons-react'
import { useRef, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import type { AllotmentHandle } from 'allotment'
import { Allotment } from 'allotment'
import { ActionIcon, Box, Button, CodeEditor, Group, Modal, SelectWithAction, Stack, Text, TextInput, createStyles, useGlobalState } from '../../components'
import { COMMON_CONTENT_TYPES, isVariableValid, Z_INDEX_ABOVE_ADMIN } from '../../utils'
import { GlobalState } from './state'
import { TopBar } from './TopBar'

const isReadyForCreate = (varName: string, keys: string[]): boolean => {
	const nameIsNotUsed = !keys.includes(varName)
	const isVariableNameValid = isVariableValid(varName) && nameIsNotUsed
	return isVariableNameValid && varName.length > 0
}

const useStyles = createStyles(() => ({
	modalInner: {
		padding: '5vh 2vw',
	},
}))

export function ExtendedView() {
	const {
		blockId,
		blockName,
		actions: stateActions,
		isModalOpen,
		content,
		stdStream,
		newInputVarName,
		newOutputVarName,
		inputs,
		outputs,
		inputCode,
		mode,
	} = useGlobalState((state: GlobalState) => state)
	const { updateState, runCode, addNewInput, chooseInput, removeInput, addNewOutput, chooseContentType, removeOutput } = stateActions
	const [isEditorVisible, setEditorVisible] = useState(true)
	const [isInputsVisible, setInputsVisible] = useState(true)
	const [isOutputsVisible, setOutputsVisible] = useState(true)
	const sidebarHandleRef = useRef<AllotmentHandle>(null)

	const isNewInputNameReady = isReadyForCreate(newInputVarName, Object.keys(inputs))
	const isNewOutputNameReady = isReadyForCreate(
		newOutputVarName,
		outputs.map((i) => i.description)
	)

	const { modalInner } = useStyles().classes

	const isViewerMode = mode === 'viewer'
	const availableBeacons = useAvailableBeacons()
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	const { value, status } = useWatch(inputCode)
	let preparedValue = value

	if ((status !== 'ready' && status !== 'initial') || !preparedValue) {
		preparedValue = ''
	}

	const code = isViewerMode ? preparedValue : content

	useHotkeys([
		['Escape', () => updateState({ isModalOpen: false })],
		['mod+Enter', () => runCode(code)],
	])

	return (
		<Modal
			zIndex={Z_INDEX_ABOVE_ADMIN}
			overlayProps={{ opacity: 0.7, blur: 3 }}
			opened={isModalOpen}
			onClose={() => updateState({ isModalOpen: false })}
			classNames={{ inner: modalInner }}
			styles={{
				content: { height: '100%' },
				body: { height: 'calc(100% - 60px)', boxSizing: 'border-box' },
			}}
			title={
				<Text fz="md" fw="bold">
					{`Python Code${blockName ? ': ' + blockName : ''}`}
				</Text>
			}
		>
			<Allotment>
				<Allotment.Pane minSize={300}>
					<Allotment vertical>
						<Allotment.Pane minSize={54} visible={isEditorVisible}>
							<Stack bg={'#fff'} style={{ height: '100%' }} spacing={0}>
								<Group px="sm" py="xs" position="apart" style={{ borderBottom: '2px solid #ced4da', height: '54px' }} spacing="xs">
									<TopBar code={code} showPopover />
								</Group>
								<CodeEditor
									withBorder={false}
									type={'python'}
									value={code}
									onChange={(val) => {
										if (mode === 'editor') {
											updateState({ content: val })
										}
									}}
									onKeyDown={(event) => {
										if ((event.ctrlKey || event.metaKey) && event.code === 'Enter') {
											runCode(code)
											event.stopPropagation()
										}
									}}
								/>
							</Stack>
						</Allotment.Pane>
						<Allotment.Pane preferredSize={'20%'} minSize={36}>
							<Stack bg={'#fff'} style={{ height: '100%' }} spacing={0}>
								<Group px="sm" py="xs" position="apart" style={{ borderBottom: '1px solid #ced4da' }} spacing="xs">
									<Text fz={14}>{__('stdout/stderr', 'inseri-core')}</Text>
									<ActionIcon style={{ height: '100%' }} onClick={() => setEditorVisible(!isEditorVisible)}>
										{isEditorVisible ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
									</ActionIcon>
								</Group>
								<CodeEditor type={'text'} value={stdStream} showLineNo={false} withBorder={false} />
							</Stack>
						</Allotment.Pane>
					</Allotment>
				</Allotment.Pane>
				<Allotment.Pane preferredSize={'20%'} minSize={240}>
					<Box bg={'#fff'} style={{ height: '100%' }}>
						<Allotment
							ref={sidebarHandleRef}
							vertical
							onChange={(sizes) => {
								setInputsVisible(sizes[0] > 36)
								setOutputsVisible(sizes[1] > 36)
							}}
						>
							<Allotment.Pane preferredSize={'50%'} minSize={36}>
								<Stack spacing={0} style={{ height: '100%' }}>
									<Button
										variant="default"
										styles={{ root: { border: '0', width: '100%', flexShrink: 0 }, inner: { justifyContent: 'left' } }}
										onClick={() => {
											setInputsVisible(!isInputsVisible)
											if (isInputsVisible) {
												sidebarHandleRef.current?.resize([36, Infinity])
											} else {
												sidebarHandleRef.current?.reset()
											}
										}}
										leftIcon={isInputsVisible ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
									>
										<Text fz={14}>{__('Inputs from Blocks', 'inseri-core')}</Text>
									</Button>
									<div style={{ overflow: 'auto', height: '100%' }}>
										<Stack p="sm">
											{Object.keys(inputs).map((varName) => (
												<SelectWithAction
													key={varName}
													label={varName}
													placeholder="Choose a block source"
													title="Remove variable"
													value={inputs[varName].key}
													onChange={(key) => chooseInput(varName, availableBeacons[key!])}
													onClick={() => removeInput(varName)}
													icon={<IconX size={16} />}
													data={selectData}
													maxDropdownHeight={150}
												/>
											))}

											<TextInput
												placeholder={__('Enter variable name', 'inseri-core')}
												value={newInputVarName}
												onChange={(e) => updateState({ newInputVarName: e.currentTarget.value })}
												error={newInputVarName && !isNewInputNameReady && __('invalid name', 'inseri-core')}
												rightSection={
													<ActionIcon title="Create" disabled={!isNewInputNameReady} onClick={addNewInput}>
														<IconPlus size={16} />
													</ActionIcon>
												}
											/>
										</Stack>
									</div>
								</Stack>
							</Allotment.Pane>
							<Allotment.Pane preferredSize={'50%'} minSize={36}>
								<Stack spacing={0} style={{ height: '100%' }}>
									<Button
										variant="default"
										styles={{ root: { border: '0', width: '100%', flexShrink: 0 }, inner: { justifyContent: 'left' } }}
										onClick={() => {
											setOutputsVisible(!isOutputsVisible)
											if (isOutputsVisible) {
												sidebarHandleRef.current?.resize([Infinity, 36])
											} else {
												sidebarHandleRef.current?.reset()
											}
										}}
										leftIcon={isOutputsVisible ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
									>
										<Text fz={14}>{__('Outputs to Blocks', 'inseri-core')}</Text>
									</Button>
									<div style={{ overflow: 'auto', height: '100%' }}>
										<Stack p="sm">
											{outputs.map(({ description: varName, contentType }) => (
												<SelectWithAction
													key={varName}
													label={varName}
													placeholder="Choose content type"
													title="Remove variable"
													value={contentType}
													onChange={(newContentType) => chooseContentType(varName, newContentType ?? '')}
													onClick={() => removeOutput(varName)}
													icon={<IconX size={16} />}
													data={COMMON_CONTENT_TYPES}
													maxDropdownHeight={150}
												/>
											))}

											<TextInput
												placeholder={__('Enter variable name', 'inseri-core')}
												value={newOutputVarName}
												onChange={(e) => updateState({ newOutputVarName: e.currentTarget.value })}
												error={newOutputVarName && !isNewOutputNameReady && __('invalid name', 'inseri-core')}
												rightSection={
													<ActionIcon title="Create" disabled={!isNewOutputNameReady} onClick={addNewOutput}>
														<IconPlus size={16} />
													</ActionIcon>
												}
											/>
										</Stack>
									</div>
								</Stack>
							</Allotment.Pane>
						</Allotment>
					</Box>
				</Allotment.Pane>
			</Allotment>
		</Modal>
	)
}
