import { useControlTower, useJsonBeacons, useWatch } from '@inseri/lighthouse'
import { IconCaretDown } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, SetupEditorEnv, Text } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import View from './view'

const objectSchema = {
	type: 'array',
	items: [
		{
			properties: {
				label: { type: 'string' },
				value: {},
			},
			required: ['label', 'value'],
			additionalProperties: true,
		},
	],
}
const stringSchema = {
	type: 'array',
	items: [{ type: 'string' }],
}

const dropdownBeacon = [{ contentType: 'application/json', description: __('chosen value', 'inseri-core'), key: 'selected' }]

function EditComponent(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, isSelected } = props
	const { input, blockId, label, searchable, clearable, blockName, output } = attributes

	const [isWizardMode, setWizardMode] = useState(!input)
	const [inputBeaconKey, setInputBeaconKey] = useState(input?.key ?? '')

	const availableBeacons = useJsonBeacons(objectSchema, stringSchema)
	const selectData = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, dropdownBeacon)
	const { status } = useWatch(input)

	useEffect(() => {
		if (status === 'unavailable') {
			setAttributes({ input: undefined })
			setInputBeaconKey('')
			setWizardMode(true)
		}
	}, [status])

	useEffect(() => {
		if (producersBeacons.length > 0 && !output) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (input && !isSelected && isWizardMode) {
			setWizardMode(false)
		}
	}, [isSelected])

	return (
		<>
			<BlockControls>
				{input && (
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
						data={selectData}
						value={inputBeaconKey}
						onChange={(key) => {
							setInputBeaconKey(key!)
							setAttributes({ input: availableBeacons[key!] })
							setWizardMode(false)
						}}
					></Select>
				</Box>
			) : (
				<View {...props} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	return (
		<SetupEditorEnv {...props} baseBlockName={'dropdown'}>
			<EditComponent {...props} />
		</SetupEditorEnv>
	)
}