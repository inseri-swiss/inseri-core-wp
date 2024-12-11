import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconTable } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Button, Group, Stack, Switch, Text, TextInput } from '../../components'
import { SourceSelect } from '../../components/SourceSelect'
import { SetupEditorEnv } from '../../components/SetupEditorEnv'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import { configSchema } from './utils'
import View from './view'

const generalOptions = [
	['enableTopToolbar', 'Top Toolbar'],
	['enableBottomToolbar', 'Bottom Toolbar'],
	['enableColumnActions', 'Column Actions'],
	['enableSorting', 'Sorting'],
	['enableColumnOrdering', 'Column Ordering'],
	['enableRowVirtualization', 'Row Virtualization'],
]
const toolbarOptions = [
	['enableGlobalFilter', 'Search'],
	// ['enableColumnFilters', 'Column Filters'],
	['enableHiding', 'Column Hiding'],
	['enableDensityToggle', 'Density'],
	['enableFullScreenToggle', 'Fullscreen'],
	['enablePagination', 'Pagination'],
]

const extraOptionsWithLabel = [
	['enableRowClick', 'Emit row on click'],
	['enableCellClick', 'Emit cell on double-click'],
	['enableEditing', 'Cell editing on double-click'],
]

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputColumns, inputData, metadata, isWizardMode, actions, options, extraOptions } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!inputData
	const { updateState } = actions

	const [recordTab, setRecordTab] = useState<string | null>('Valid-Config')
	const [configTab, setConfigTab] = useState<string | null>('Valid-Config')

	const [hasRowVirtualChanged, setRowVirtualChanged] = useState(false)
	const recordOptions = useDiscover({ contentTypeFilter: recordTab === 'Valid-Config' ? 'application/json' : undefined })
	const configOptions = useDiscover({ jsonSchemas: configTab === 'Valid-Config' ? [configSchema] : undefined })

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	useEffect(() => {
		setRowVirtualChanged(false)
	}, [hasRowVirtualChanged])

	return (
		<>
			<BlockControls controls={[]}>
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
						<TextInput
							styles={{ root: { width: '100%' } }}
							label="Block Name"
							value={metadata.name}
							onChange={(event) => updateState({ metadata: { name: event.target.value } })}
						/>
					</PanelRow>
					<PanelRow>
						<Stack style={{ width: '100%' }} mt="md">
							{generalOptions.map((tableOpt) => (
								<Switch
									key={tableOpt[0]}
									styles={{ labelWrapper: { width: '100%' } }}
									label={tableOpt[1]}
									checked={options[tableOpt[0]]}
									onChange={(event) => {
										updateState({ options: { ...options, [tableOpt[0]]: event.target.checked } })
										if (tableOpt[0] === 'enableRowVirtualization') {
											setRowVirtualChanged(true)
										}
									}}
								/>
							))}
						</Stack>
					</PanelRow>
				</PanelBody>
				<PanelBody title="Toolbar Settings">
					<PanelRow>
						<Stack style={{ width: '100%' }}>
							{toolbarOptions.map((opt) => (
								<Switch
									key={opt[0]}
									styles={{ labelWrapper: { width: '100%' } }}
									label={opt[1]}
									checked={options[opt[0]]}
									onChange={(event) => updateState({ options: { ...options, [opt[0]]: event.target.checked } })}
								/>
							))}
						</Stack>
					</PanelRow>
				</PanelBody>
				<PanelBody title="Extra Settings">
					<PanelRow>
						<Stack style={{ width: '100%' }}>
							{extraOptionsWithLabel.map((opt) => (
								<Switch
									key={opt[0]}
									styles={{ labelWrapper: { width: '100%' } }}
									label={opt[1]}
									checked={extraOptions[opt[0]]}
									onChange={(event) => {
										const updater = { [opt[0]]: event.target.checked }

										if (opt[0] === 'enableCellClick' && event.target.checked) {
											updater.enableEditing = false
										}
										if (opt[0] === 'enableEditing' && event.target.checked) {
											updater.enableCellClick = false
										}

										updateState({ extraOptions: { ...extraOptions, ...updater } })
									}}
								/>
							))}
						</Stack>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode || hasRowVirtualChanged ? (
				<Stack p="md" style={{ border: '1px solid #000' }} spacing="sm">
					<Group mb="md" spacing={0}>
						<IconTable size={28} />
						<Text ml="xs" fz={24}>
							{__('Data Table', 'inseri-core')}
						</Text>
					</Group>
					<SourceSelect
						label={__('Choose table records', 'inseri-core')}
						data={recordOptions}
						selectValue={inputData}
						tabs={['Valid Config', 'All']}
						activeTab={recordTab}
						onSelectChange={(key) => updateState({ inputData: key ?? '' })}
						setActiveTab={setRecordTab}
						withAsterisk
					/>
					<SourceSelect
						label={__('Choose column config', 'inseri-core')}
						data={configOptions}
						selectValue={inputColumns}
						tabs={['Valid Config', 'All']}
						activeTab={configTab}
						onSelectChange={(key) => updateState({ inputColumns: key ?? '' })}
						setActiveTab={setConfigTab}
					/>
					<Group position="right">
						<Button disabled={!isValueSet} variant="filled" onClick={() => updateState({ isWizardMode: false })}>
							{__('Finish', 'inseri-core')}
						</Button>
					</Group>
				</Stack>
			) : (
				<View />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'dataTable'} addSuffixToInputs={['inputColumns', 'inputData']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={json.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
