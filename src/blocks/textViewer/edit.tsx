import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconFileTypography } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Text } from '@mantine/core'
import { SourceSelect } from '../../components/SourceSelect'
import { SetupEditorEnv } from '../../components/SetupEditorEnv'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import { TEXTUAL_CONTENT_TYPES } from '../../utils'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

const textualContentTypes = TEXTUAL_CONTENT_TYPES.map((t) => t.value)
const contentTypeFilter = (c: string) => textualContentTypes.includes(c) || c.startsWith('text/')

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputKey, label, metadata, isWizardMode, actions } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!inputKey
	const { updateState, chooseInput } = actions

	const [activeTab, setActiveTab] = useState<string | null>('Textual')
	const sources = useDiscover({ contentTypeFilter: activeTab === 'Textual' ? contentTypeFilter : undefined })

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
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
						<TextControl label="Block Name" value={metadata.name} onChange={(value) => updateState({ metadata: { name: value } })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconFileTypography size={28} />
						<Text ml="xs" fz={24}>
							{__('Text Viewer', 'inseri-core')}
						</Text>
					</Group>
					<SourceSelect
						label="Display code by selecting a block source"
						data={sources}
						selectValue={inputKey}
						tabs={['Textual', 'All']}
						activeTab={activeTab}
						onSelectChange={(key) => chooseInput(key ?? '')}
						setActiveTab={setActiveTab}
						withAsterisk
					/>
				</Box>
			) : (
				<View renderResizable={renderResizable} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'textViewer'} addSuffixToInputs={['inputKey']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={json.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
