import { InseriRoot, useDiscover } from '@inseri/lighthouse-next'
import { IconHtml } from '@tabler/icons-react'
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

	const { inputKey, blockName, isWizardMode, mode, actions } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!inputKey
	const { updateState } = actions

	const sources = useDiscover({ contentTypeFilter: 'html' })
	const options = sources.map((item) => ({ label: item.description, value: item.key }))

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

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
						{!isWizardMode && (
							<>
								<ToolbarButton isActive={mode === 'code'} onClick={() => updateState({ mode: 'code' })}>
									{__('HTML', 'inseri-core')}
								</ToolbarButton>
								<ToolbarButton isActive={mode === 'preview'} onClick={() => updateState({ mode: 'preview' })}>
									{__('Preview', 'inseri-core')}
								</ToolbarButton>
							</>
						)}
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconHtml size={28} />
						<Text ml="xs" fz={24}>
							{__('HTML Code', 'inseri-core')}
						</Text>
					</Group>

					<Select
						label={__('Render HTML by selecting a block source', 'inseri-core')}
						data={options}
						value={inputKey}
						onChange={(key) => updateState({ inputKey: key ?? '', isWizardMode: false })}
					/>
				</Box>
			) : (
				<View isGutenbergEditor isSelected={isSelected} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'html'}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
