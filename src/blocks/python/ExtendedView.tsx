import { useAvailableBeacons } from '@inseri/lighthouse'
import { useHotkeys } from '@mantine/hooks'
import { IconChevronDown, IconChevronRight, IconChevronUp, IconPlus, IconX } from '@tabler/icons'
import { useRef, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Allotment, AllotmentHandle } from 'allotment'
import { ActionIcon, Box, Button, CodeEditor, Group, Modal, SelectWithAction, Stack, Text, TextInput, useGlobalState } from '../../components'
import { COMMON_CONTENT_TYPES, isVariableValid, Z_INDEX_ABOVE_ADMIN } from '../../utils'
import { GlobalState } from './state'
import { TopBar } from './TopBar'

const isReadyForCreate = (varName: string, keys: string[]): boolean => {
	const nameIsNotUsed = !keys.includes(varName)
	const isVariableNameValid = isVariableValid(varName) && nameIsNotUsed
	return isVariableNameValid && varName.length > 0
}

export function ExtendedView() {
	const { blockId, blockName, actions, isModalOpen, content, stdStream, newInputVarName, newOutputVarName, inputs, outputs } = useGlobalState(
		(state: GlobalState) => state
	)
	const { updateState, runCode, addNewInput, chooseInput, removeInput, addNewOutput, chooseContentType, removeOutput } = actions
	const [isEditorVisible, setEditorVisible] = useState(true)
	const [isInputsVisible, setInputsVisible] = useState(true)
	const [isOutputsVisible, setOutputsVisible] = useState(true)
	const sidebarHandleRef = useRef<AllotmentHandle>(null)

	const isNewInputNameReady = isReadyForCreate(newInputVarName, Object.keys(inputs))
	const isNewOutputNameReady = isReadyForCreate(
		newOutputVarName,
		outputs.map((i) => i.description)
	)

	const availableBeacons = useAvailableBeacons()
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	useHotkeys([
		['Escape', () => updateState({ isModalOpen: false })],
		['mod+Enter', runCode],
	])

	return (
		<Modal
			zIndex={Z_INDEX_ABOVE_ADMIN}
			size="100%"
			overlayOpacity={0.7}
			overlayBlur={3}
			opened={isModalOpen}
			onClose={() => updateState({ isModalOpen: false })}
			styles={{
				modal: { background: '#f0f0f1', height: '100%' },
				body: { height: '100%', display: 'flex', flexDirection: 'column' },
			}}
			overflow="inside"
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
									<TopBar showPopover />
								</Group>
								<CodeEditor
									withBorder={false}
									type={'python'}
									value={content}
									onChange={(val) => {
										updateState({ content: val })
									}}
									onKeyDown={(event) => {
										if ((event.ctrlKey || event.metaKey) && event.code === 'Enter') {
											runCode()
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
									{isInputsVisible && (
										<Stack p="sm" style={{ overflow: 'auto' }}>
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
												/>
											))}

											<TextInput
												mt="sm"
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
									)}
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
									<Stack p="sm" style={{ overflow: 'auto' }}>
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
											/>
										))}

										<TextInput
											mt="sm"
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
								</Stack>
							</Allotment.Pane>
						</Allotment>
					</Box>
				</Allotment.Pane>
			</Allotment>
		</Modal>
	)
}
