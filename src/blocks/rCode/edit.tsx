import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconChevronLeft, IconWindowMaximize } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarButton, ToolbarGroup, Button as WPButton } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Button, Group, Text } from '@mantine/core'
import { SourceSelect } from '../../components/SourceSelect'
import { SetupEditorEnv } from '../../components/SetupEditorEnv'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import { ExtendedView } from '../../components/ExtendedView'
import { HidingWrapper } from '../../utils'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputCode, label, mode, metadata, editable, isWizardMode, selectedMode, wizardStep, isModalOpen, isVisible, autoTrigger } = useGlobalState(
		(state: GlobalState) => state
	)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const isValueSet = mode === 'editor' || (!!mode && !!inputCode)

	const [activeTab, setActiveTab] = useState<string | null>('R')
	const sources = useDiscover({ contentTypeFilter: activeTab === 'R' ? 'x-r' : undefined })

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

	const renderHiding = (children: JSX.Element) => (
		<HidingWrapper isSelected={isSelected} isVisible={isVisible}>
			{children}
		</HidingWrapper>
	)

	return (
		<>
			<ExtendedView type="r" />
			<BlockControls controls={[]}>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton icon={edit} title={__('Edit', 'inseri-core')} onClick={() => updateState({ isWizardMode: !isWizardMode })} />
						<ToolbarButton
							icon={<IconWindowMaximize style={{ fill: 'none' }} />}
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
						<Box mb="sm">
							<WPButton
								icon={<IconWindowMaximize style={{ fill: 'none' }} />}
								variant="primary"
								onClick={() => {
									updateState({ isModalOpen: true })
								}}
							>
								{__('Open extended view', 'inseri-core')}
							</WPButton>
						</Box>
					</PanelRow>
					<PanelRow>
						<TextControl label="Block Name" value={metadata.name} onChange={(value) => updateState({ metadata: { name: value } })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Show block', 'inseri-core')}
							help={isVisible ? __('Block is visible.', 'inseri-core') : __('Block is invisible.', 'inseri-core')}
							checked={isVisible}
							onChange={(newVisibility) => {
								updateState({ isVisible: newVisibility })
								if (!newVisibility) {
									updateState({ autoTrigger: true })
								}
							}}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Execute automatically', 'inseri-core')}
							help={
								autoTrigger
									? __('Code is executed initially and on changes of inputs.', 'inseri-core')
									: __('Code needs to be executed manually.', 'inseri-core')
							}
							checked={autoTrigger}
							onChange={(newTriggerState) => {
								if (isVisible) {
									updateState({ autoTrigger: newTriggerState })
								}
							}}
						/>
					</PanelRow>
					{mode === 'editor' && isVisible && (
						<PanelRow>
							<ToggleControl
								label={__('publicly editable', 'inseri-core')}
								help={editable ? __('Code is editable by anyone.', 'inseri-core') : __('Code cannot be modified by anyone.', 'inseri-core')}
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
						<Text ml="xs" fz={24}>
							{__('R Code', 'inseri-core')}
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
							<SourceSelect
								mb="lg"
								label={__('Display code by selecting a block source', 'inseri-core')}
								data={sources}
								selectValue={inputCode}
								tabs={['R', 'All']}
								activeTab={activeTab}
								onSelectChange={(key) => updateState({ inputCode: key ?? '', isWizardMode: !key, mode: 'viewer' })}
								setActiveTab={setActiveTab}
								withAsterisk
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
				<View {...props} isGutenbergEditor renderResizable={renderResizable} renderHiding={renderHiding} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'r-code'} addSuffixToInputs={['inputCode']} addSuffixToInputRecord={['inputs']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={json.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
