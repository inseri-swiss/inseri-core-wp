import { useControlTower, useDispatch, useJsonBeacons, useWatch } from '@inseri/lighthouse'
import { IconCaretDown } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarGroup, ToggleControl } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, Text } from '../../components'
import { Attributes } from './index'
import config from './block.json'

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

export function DropdownEdit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, isSelected } = props
	const { input, blockId, label, searchable, clearable, blockName } = attributes

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
		if (producersBeacons.length > 0) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (input && !isSelected && isWizardMode) {
			setWizardMode(false)
		}
	}, [isSelected])

	const toolbarControls = [
		{
			icon: edit,
			isActive: isWizardMode,
			onClick: () => setWizardMode(!isWizardMode),
			title: __('Edit', 'inseri-core'),
		},
	]
	return (
		<>
			<BlockControls>{input && <ToolbarGroup controls={toolbarControls} />}</BlockControls>
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
				<DropdownView {...props} />
			)}
		</>
	)
}

export function DropdownView(props: { attributes: Readonly<Attributes> }) {
	const { attributes } = props
	const { value, contentType } = useWatch(attributes.input)
	const dispatch = useDispatch(attributes.output)

	const data = contentType.match('application/json') && !!value ? value : []

	return (
		<Box p="md">
			<Select
				label={attributes.label}
				data={data}
				onChange={(item) => dispatch({ status: 'ready', value: item })}
				searchable={attributes.searchable}
				clearable={attributes.clearable}
			/>
		</Box>
	)
}
