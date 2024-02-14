import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconTable } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Group, Select, SetupEditorEnv, Stack, StateProvider, Text, TextInput, useGlobalState } from '../../components'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputColumns, inputData, blockName, isWizardMode, actions } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!inputColumns && !!inputData
	const { updateState } = actions

	const sources = useDiscover({ contentTypeFilter: 'application/json' })
	const options = sources.map((item) => ({ label: item.description, value: item.key }))

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

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
							value={blockName}
							onChange={(event) => updateState({ blockName: event.target.value })}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Stack p="md" style={{ border: '1px solid #000' }} spacing="sm">
					<Group mb="md" spacing={0}>
						<IconTable size={28} />
						<Text ml="xs" fz={24}>
							{__('Table', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Choose column config', 'inseri-core')}
						data={options}
						value={inputColumns}
						onChange={(key) => updateState({ inputColumns: key ?? '', isWizardMode: !key || !inputData })}
						clearable
					/>
					<Select
						label={__('Choose table records', 'inseri-core')}
						data={options}
						value={inputData}
						onChange={(key) => updateState({ inputData: key ?? '', isWizardMode: !inputColumns || !key })}
						clearable
					/>
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
		<SetupEditorEnv {...props} baseBlockName={'table'} addSuffixToInputs={['inputKey']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
