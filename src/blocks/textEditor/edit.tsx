import { useControlTower, useDispatch } from '@inseri/lighthouse'
import { IconEdit } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, SetupEditorEnv, StateProvider, Text, useGlobalState } from '../../components'
import { TEXTUAL_CONTENT_TYPES } from '../../utils'
import { default as config, default as json } from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

const textEditorBeacon = { contentType: '', description: 'content', key: 'content', default: '' }

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { output, label, blockId, blockName, editable, isWizardMode, prevContentType, actions, isVisible } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!output.contentType
	const contentType = output.contentType
	const outputBeacon = output.key ? output : undefined

	const { updateState, setContentType } = actions

	const beaconConfigs = [{ ...textEditorBeacon, contentType }]
	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, beaconConfigs)
	const dispatch = useDispatch(outputBeacon)

	const editableHelpText = editable ? __('Visitors can change the content.', 'inseri-core') : __('Visitors cannot change the content.', 'inseri-core')

	useEffect(() => {
		if (producersBeacons.length > 0 && !output.key) {
			updateState({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (prevContentType !== contentType) {
			dispatch({ status: 'unavailable' })

			setTimeout(() => dispatch({ contentType, status: 'initial' }), 100)
		}
	}, [contentType])

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
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
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
									updateState({ editable: false })
								}
							}}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('publicly editable', 'inseri-core')}
							help={editableHelpText}
							checked={editable}
							onChange={() => {
								if (isVisible) {
									updateState({ editable: !editable })
								}
							}}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconEdit size={28} />
						<Text ml="xs" fz={24}>
							{__('Text Editor', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Choose a format', 'inseri-core')}
						mb="md"
						searchable
						data={TEXTUAL_CONTENT_TYPES}
						value={contentType}
						onChange={(v) => setContentType(v ?? '')}
					/>
				</Box>
			) : (
				<View isGutenbergEditor isSelected={isSelected} renderResizable={renderResizable} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'textEditor'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<EditComponent {...props} />
			</StateProvider>
		</SetupEditorEnv>
	)
}
