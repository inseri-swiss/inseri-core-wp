import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconZoomInArea } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, SetupEditorEnv, SourceSelect, StateProvider, Text, useGlobalState } from '../../components'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

const urlSchema = {
	$ref: '#/definitions/URL',
	definitions: {
		URL: { type: 'string', format: 'uri', pattern: '^https?://' },
	},
}
const MIN_HEIGHT = 200

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputKey, blockName, isWizardMode, actions, showTitle, showInformationPanel, showBadge, dynamicHeight, height } = useGlobalState(
		(state: GlobalState) => state
	)
	const isValueSet = !!inputKey
	const { updateState } = actions

	const [activeTab, setActiveTab] = useState<string | null>('All')
	const sources = useDiscover({ jsonSchemas: activeTab === 'Valid-URL' ? [urlSchema] : undefined })

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const infoPanelHelp = showInformationPanel ? __('The information panel is shown.', 'inseri-core') : __('The information panel is hidden.', 'inseri-core')

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
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Show Content Title', 'inseri-core')}
							help={showTitle ? __('The title is displayed.', 'inseri-core') : __('The title is hidden.', 'inseri-core')}
							checked={showTitle}
							onChange={() => updateState({ showTitle: !showTitle })}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Show Information Panel', 'inseri-core')}
							help={infoPanelHelp}
							checked={showInformationPanel}
							onChange={() => updateState({ showInformationPanel: !showInformationPanel })}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Show IIIF Badge', 'inseri-core')}
							help={showBadge ? __('IIIF Badge Title is displayed.', 'inseri-core') : __('IIIF Badge is hidden.', 'inseri-core')}
							checked={showBadge}
							onChange={() => updateState({ showBadge: !showBadge })}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Dynamic Height', 'inseri-core')}
							help={dynamicHeight ? __('Height is dynamic.', 'inseri-core') : __('Height is fixed.', 'inseri-core')}
							checked={dynamicHeight}
							onChange={() => updateState({ dynamicHeight: !dynamicHeight })}
						/>
					</PanelRow>
					{!dynamicHeight && (
						<PanelRow>
							<div style={{ width: '100%' }}>
								<TextControl
									label={__('height', 'inseri-core')}
									type="number"
									min={MIN_HEIGHT}
									value={height}
									onChange={(value) => {
										const newVal = parseInt(value)
										if (newVal >= MIN_HEIGHT) {
											updateState({ height: newVal })
										}
									}}
								/>
							</div>
						</PanelRow>
					)}
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconZoomInArea size={28} />
						<Text ml="xs" fz={24}>
							{__('IIIF Viewer', 'inseri-core')}
						</Text>
					</Group>
					<SourceSelect
						label={__('Display IIIF content by selecting a block source', 'inseri-core')}
						data={sources}
						selectValue={inputKey}
						tabs={['All', 'Valid URL']}
						activeTab={activeTab}
						onSelectChange={(key) => updateState({ inputKey: key ?? '', isWizardMode: !key })}
						setActiveTab={setActiveTab}
						withAsterisk
					/>
				</Box>
			) : (
				<View />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'iiif-viewer'} addSuffixToInputs={['inputKey']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
