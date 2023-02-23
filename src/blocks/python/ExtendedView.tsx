import { useAvailableBeacons } from '@inseri/lighthouse'
import { useHotkeys, usePrevious } from '@mantine/hooks'
import { IconPlus, IconX } from '@tabler/icons'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { ActionIcon, Box, CodeEditor, Group, Modal, SelectWithAction, Stack, Tabs, Text, TextInput, useGlobalState } from '../../components'
import { isVariableValid, Z_INDEX_ABOVE_ADMIN } from '../../utils'
import { GlobalState } from './state'
import { TopBar } from './TopBar'

export function ExtendedView() {
	const { blockId, blockName, actions, isModalOpen, content, blockerr, stdout, stderr, newVarName, inputs } = useGlobalState((state: GlobalState) => state)
	const { updateState, runCode, addNewInput, chooseInput, removeInput } = actions
	const [chosenTab, setChosenTab] = useState<string | null>('stdout')

	const errors = [blockerr, stderr].filter(Boolean).join('\n')
	const prevErrors = usePrevious(errors)

	const nameIsNotUsed = !Object.keys(inputs).includes(newVarName)
	const isVariableNameValid = isVariableValid(newVarName) && nameIsNotUsed
	const isReadyForCreate = isVariableNameValid && newVarName.length > 0

	const availableBeacons = useAvailableBeacons('application/json')
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	useHotkeys([
		['Escape', () => updateState({ isModalOpen: false })],
		['mod+Enter', runCode],
	])

	useEffect(() => {
		if (!prevErrors && errors) {
			setChosenTab('stderr')
		}
	}, [errors])

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
			<Group align="stretch" style={{ flex: 1 }}>
				<Stack style={{ flex: 1 }}>
					<Stack bg={'#fff'} style={{ flex: 1 }}>
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
					<Tabs value={chosenTab} onTabChange={setChosenTab} bg={'#fff'}>
						<Tabs.List>
							<Tabs.Tab value="stdout">{__('standard output', 'inseri-core')}</Tabs.Tab>
							<Tabs.Tab value="stderr">{__('errors', 'inseri-core')}</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value="stdout">
							<Box>
								<CodeEditor type={'text'} value={stdout} showLineNo={false} withBorder={false} />
							</Box>
						</Tabs.Panel>
						<Tabs.Panel value="stderr">
							<Box>
								<CodeEditor type={'text'} value={errors} showLineNo={false} withBorder={false} fontColor={'#e03131'} />
							</Box>
						</Tabs.Panel>
					</Tabs>
				</Stack>
				<Box bg={'#fff'}>
					<Group style={{ borderBottom: '2px solid #ced4da', height: '54px' }}>
						<Text fz={14} pl="sm">
							{__('Inputs from Blocks', 'inseri-core')}
						</Text>
					</Group>
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
							/>
						))}

						<TextInput
							mt="sm"
							placeholder={__('Enter variable name', 'inseri-core')}
							value={newVarName}
							onChange={(e) => updateState({ newVarName: e.currentTarget.value })}
							error={!isVariableNameValid && __('invalid name', 'inseri-core')}
							rightSection={
								<ActionIcon title="Create" disabled={!isReadyForCreate} onClick={addNewInput}>
									<IconPlus size={16} />
								</ActionIcon>
							}
						/>
					</Stack>
				</Box>
			</Group>
		</Modal>
	)
}
