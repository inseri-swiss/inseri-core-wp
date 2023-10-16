import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconZoomInArea } from '@tabler/icons-react'
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

const urlSchema = {
	$ref: '#/definitions/URL',
	definitions: {
		URL: { type: 'string', format: 'uri', pattern: '^https?://' },
	},
}

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputKey, blockName, isWizardMode, actions } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!inputKey
	const { updateState } = actions

	const sources = useDiscover({ jsonSchemas: [urlSchema] })
	const options = sources.map((item) => ({ label: item.description, value: item.key }))

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

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
					<Select
						label={__('Display IIIF content by selecting a block source', 'inseri-core')}
						data={options}
						value={inputKey}
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
		<SetupEditorEnv {...props} baseBlockName={'iiif-viewer'} addSuffixToInputs={['inputKey']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
