import { InseriRoot } from '@inseri/lighthouse'
import { IconFiles } from '@tabler/icons-react'
import { BlockControls, InspectorControls, MediaPlaceholder } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useDispatch as useWpDispatch } from '@wordpress/data'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { SetupEditorEnv } from '../../components'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import { HidingWrapper } from '../../utils'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(props: BlockEditProps<Attributes>) {
	const { createErrorNotice } = useWpDispatch('core/notices')
	const { isSelected } = props
	const { metadata, label, isWizardMode, actions, fileIds, files, isVisible } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = fileIds.length > 0

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const renderHiding = (children: JSX.Element) => (
		<HidingWrapper isSelected={isSelected} isVisible={isVisible}>
			{children}
		</HidingWrapper>
	)

	return (
		<>
			<BlockControls controls={[]}>
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
						<TextControl label="Block Name" value={metadata.name} onChange={(value) => updateState({ metadata: { name: value } })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
					{files.length === 1 && (
						<PanelRow>
							<ToggleControl
								label={__('Show block', 'inseri-core')}
								help={isVisible ? __('Block is visible.', 'inseri-core') : __('Block is invisible.', 'inseri-core')}
								checked={isVisible}
								onChange={(newVisibility) => {
									updateState({ isVisible: newVisibility })
								}}
							/>
						</PanelRow>
					)}
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<MediaPlaceholder
					onSelect={(elements) => {
						const newFileIds = elements.map((e) => e.id)

						updateState({
							fileIds: newFileIds,
							selectedFileId: newFileIds.length === 1 ? String(newFileIds[0]) : null,
							isWizardMode: false,
							isVisible: true,
						})
					}}
					multiple={true}
					labels={{ title: 'Media Collection' }}
					icon={<IconFiles style={{ fill: 'none' }} />}
					onError={(err) => createErrorNotice(err, { type: 'snackbar' })}
					onHTMLDrop={(_html: string) => {}}
				></MediaPlaceholder>
			) : (
				<View renderHiding={renderHiding} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'mediaCollection'}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={config.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(config.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
