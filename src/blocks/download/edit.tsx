import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconFileDownload } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { RecoilRoot, useRecoilState } from 'recoil'
import { Box, Group, Text } from '@mantine/core'
import { SourceSelect } from '../../components/SourceSelect'
import { SetupEditorEnv } from '../../components/SetupEditorEnv'
import json from './block.json'
import { Attributes } from './index'
import { wizardState } from './state'
import View from './view'

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected, setAttributes, attributes } = props
	const { blockId, metadata, inputKey, label, fileName, fileExt } = attributes

	const [isWizardMode, setWizardMode] = useRecoilState(wizardState(blockId))
	const isValueSet = !!inputKey

	useEffect(() => {
		setWizardMode(!inputKey)
	}, [])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			setWizardMode(false)
		}
	}, [isSelected])

	const [activeTab, setActiveTab] = useState<string | null>('All')
	const sources = useDiscover({ contentTypeFilter: '' })

	return (
		<>
			<BlockControls controls={[]}>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton icon={edit} isActive={isWizardMode} onClick={() => setWizardMode(!isWizardMode)} title={__('Edit', 'inseri-core')} />
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl
							label={__('Block Name', 'inseri-core')}
							value={metadata.name}
							onChange={(value) => {
								setAttributes({ metadata: { name: value } })
							}}
						/>
					</PanelRow>
					<PanelRow>
						<TextControl label={__('Label', 'inseri-core')} value={label} onChange={(value) => setAttributes({ label: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label={__('File Name', 'inseri-core')} value={fileName} onChange={(value) => setAttributes({ fileName: value })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Determine file extension automatically', 'inseri-core')}
							checked={fileExt === undefined}
							onChange={(checked) => setAttributes({ fileExt: checked ? undefined : '' })}
						/>
					</PanelRow>
					{fileExt !== undefined && (
						<PanelRow>
							<TextControl
								label={__('File Extension', 'inseri-core')}
								value={fileExt ?? ''}
								onChange={(value) => {
									setAttributes({ fileExt: value })
								}}
							/>
						</PanelRow>
					)}
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
					<SourceSelect
						label={__('Let visitor download data by selecting a block source', 'inseri-core')}
						data={sources}
						selectValue={inputKey}
						tabs={['All']}
						activeTab={activeTab}
						onSelectChange={(key) => {
							setAttributes({ inputKey: key ?? '' })
							setWizardMode(!key)
						}}
						setActiveTab={setActiveTab}
						withAsterisk
					/>
				</Box>
			) : (
				<View attributes={attributes} setAttributes={setAttributes} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'download'} addSuffixToInputs={['inputKey']}>
			<RecoilRoot>
				<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={json.name} clientId={clientId}>
					<EditComponent {...props} />
				</InseriRoot>
			</RecoilRoot>
		</SetupEditorEnv>
	)
}
