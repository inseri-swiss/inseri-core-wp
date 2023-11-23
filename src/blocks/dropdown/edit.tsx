import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconCaretDown } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, SetupEditorEnv, Text } from '../../components'
import json from './block.json'
import { Attributes } from './index'
import View from './view'
import { objectSchema, stringSchema } from './utils'

function EditComponent(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, isSelected } = props
	const { inputKey, label, searchable, clearable, blockName } = attributes

	const [isWizardMode, setWizardMode] = useState(!inputKey)
	const isValueSet = !!inputKey

	const sources = useDiscover({ jsonSchemas: [objectSchema, stringSchema] })
	const options = sources.map((item) => ({ label: item.description, value: item.key }))

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			setWizardMode(false)
		}
	}, [isSelected])

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
						<TextControl label="Block Name" value={blockName} onChange={(value) => setAttributes({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => setAttributes({ label: value })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl label="Searchable" checked={searchable} onChange={() => setAttributes({ searchable: !searchable })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl label="Clearable" checked={clearable} onChange={() => setAttributes({ clearable: !clearable })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="lg" spacing={0}>
						<IconCaretDown size={28} />
						<Text ml="xs" fz={24}>
							{__('Dropdown', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Provide options by selecting a block source', 'inseri-core')}
						data={options}
						value={inputKey}
						onChange={(key) => {
							setAttributes({ inputKey: key ?? '' })
							setWizardMode(false)
						}}
					></Select>
				</Box>
			) : (
				<View {...props} setWizardMode={setWizardMode} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'dropdown'} addSuffixToInputs={['inputKey']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name} clientId={clientId}>
				<EditComponent {...props} />
			</InseriRoot>
		</SetupEditorEnv>
	)
}
