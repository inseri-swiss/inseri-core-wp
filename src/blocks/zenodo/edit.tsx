import { InseriRoot } from '@inseri/lighthouse'
import { IconBooks } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Button, Checkbox, Group, Loader, Stack, Text, TextInput } from '../../components'
import { SetupEditorEnv } from '../../components/SetupEditorEnv'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import { HidingWrapper, getFormattedBytes } from '../../utils'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { metadata, label, isWizardMode, files, isVisible, doi, doiError, isWizardLoading, record, hasWizardError } = useGlobalState(
		(state: GlobalState) => state
	)
	const { updateState, setDoi } = useGlobalState((state: GlobalState) => state.actions)
	const isValueSet = files.length > 0

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
						<TextControl label="Block Name" value={metadata.name} onChange={(value) => updateState({ metadata: { ...metadata, name: value } })} />
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
				<Stack p="md" style={{ border: '1px solid #000' }}>
					<Group mb="sm" spacing={0}>
						<IconBooks size={28} />
						<Text ml="xs" fz={24}>
							{__('Zenodo Repository', 'inseri-core')}
						</Text>
					</Group>
					<TextInput
						label="DOI"
						value={doi}
						onChange={(event) => setDoi(event.currentTarget.value)}
						error={doiError}
						rightSection={isWizardLoading && <Loader size="xs" />}
						withAsterisk
					/>

					{hasWizardError && (
						<>
							<Group position="center" mt="md">
								<Text fz={16} color="red">
									{__('Record not found', 'inseri-core')}
								</Text>
							</Group>
						</>
					)}

					{record && (
						<>
							<Text fz={16} mt="md">
								{record.metadata.title}
							</Text>
							{record.metadata.version && <Text fz={16}>Version: {record.metadata.version}</Text>}

							<Stack style={{ maxHeight: 400, overflow: 'auto', paddingRight: 16, paddingBottom: 10 }}>
								{record.files.map((f) => (
									<Group position="apart" key={f.key}>
										<Checkbox
											label={f.key}
											checked={!!files.find((elem) => elem === f.key)}
											onChange={(event) => {
												let newFiles = []

												if (event.currentTarget.checked) {
													newFiles = [...files, f.key]
												} else {
													newFiles = files.filter((elem) => elem !== f.key)
												}

												updateState({ files: newFiles, selectedFile: newFiles.length === 1 ? newFiles[0] : null })
											}}
										/>
										<Text fz={12}>{getFormattedBytes(f.size ?? 0)}</Text>
									</Group>
								))}
							</Stack>

							<Group position="right">
								<Button variant="filled" onClick={() => updateState({ isWizardMode: false })} disabled={!isValueSet}>
									{__('Use selected files', 'inseri-core')}
								</Button>
							</Group>
						</>
					)}
				</Stack>
			) : (
				<View renderHiding={renderHiding} attributes={props.attributes} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'zenodo'}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={config.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(config.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
