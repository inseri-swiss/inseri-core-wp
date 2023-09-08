import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconFileDownload } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { RecoilRoot, useRecoilState } from 'recoil'
import { Box, Group, Select, SetupEditorEnv, Text } from '../../components'
import json from './block.json'
import { Attributes } from './index'
import { wizardState } from './state'
import View from './view'

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected, setAttributes, attributes } = props
	const { blockId, blockName, inputKey, label, fileName } = attributes

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

	const sources = useDiscover({ contentTypeFilter: '' })
	const options = sources.map((item) => ({ label: item.description, value: item.key }))

	return (
		<>
			<BlockControls>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton icon={edit} isActive={isWizardMode} onClick={() => setWizardMode(!isWizardMode)} title={__('Edit', 'inseri-core')} />
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label={__('Block Name', 'inseri-core')} value={blockName} onChange={(value) => setAttributes({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label={__('Label', 'inseri-core')} value={label} onChange={(value) => setAttributes({ label: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label={__('File Name', 'inseri-core')} value={fileName} onChange={(value) => setAttributes({ fileName: value })} />
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
						onChange={(key) => {
							setAttributes({ inputKey: key ?? '' })
							setWizardMode(false)
						}}
					/>
				</Box>
			) : (
				<View attributes={attributes} setAttributes={setAttributes} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'download'}>
			<RecoilRoot>
				<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
					<EditComponent {...props} />
				</InseriRoot>
			</RecoilRoot>
		</SetupEditorEnv>
	)
}
