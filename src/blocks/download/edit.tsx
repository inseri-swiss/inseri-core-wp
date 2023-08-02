import { InseriRoot, useDiscover } from '@inseri/lighthouse-next'
import { IconFileDownload } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, SetupEditorEnv, StateProvider, Text, useGlobalState } from '../../components'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, inputKey, isWizardMode, actions, label, fileName } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = !!inputKey

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const sources = useDiscover({ contentTypeFilter: '' })
	const options = sources.map((item) => ({ label: item.description, value: item.key }))

	return (
		<>
			<BlockControls>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton
							icon={edit}
							isActive={isWizardMode}
							onClick={() => {
								updateState({ isWizardMode: !isWizardMode })
							}}
							title={__('Edit', 'inseri-core')}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label={__('Block Name', 'inseri-core')} value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label={__('Label', 'inseri-core')} value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label={__('File Name', 'inseri-core')} value={fileName} onChange={(value) => updateState({ fileName: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="lg" spacing={0}>
						<IconFileDownload size={28} />
						<Text ml="xs" fz={24}>
							{__('Download', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Let visitor download data by selecting a block source', 'inseri-core')}
						data={options}
						value={inputKey}
						searchable
						onChange={(key) => updateState({ inputKey: key ?? '', isWizardMode: false })}
					/>
				</Box>
			) : (
				<View />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'download'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
					<EditComponent {...props} />
				</InseriRoot>
			</StateProvider>
		</SetupEditorEnv>
	)
}
