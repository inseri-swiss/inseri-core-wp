import { useControlTower, useDispatch, useJsonBeacons, useWatch } from '@inseri/lighthouse'
import { generateId } from '@inseri/utils'
import { IconCaretDown } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, InseriThemeProvider, Select, Text } from '../../components'
import { Attributes } from './index'

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

	const [isWizardMode, setWizardMode] = useState(!attributes.input)
	const [inputBeaconKey, setInputBeaconKey] = useState(attributes.input?.key ?? '')
	const [blockName, setBlockName] = useState(attributes.blockName ?? 'dropdown' + generateId(3))

	const availableBeacons = useJsonBeacons(objectSchema, stringSchema)
	const selectData = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))

	const producersBeacons = useControlTower({ blockId: attributes.blockId, blockType: 'inseri-core/dropdown', instanceName: blockName }, dropdownBeacon)

	useEffect(() => {
		if (producersBeacons.length > 0) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		setAttributes({ blockName: blockName })
	}, [blockName])

	useEffect(() => {
		if (attributes.input && !isSelected && isWizardMode) {
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
			<BlockControls>{attributes.input && <ToolbarGroup controls={toolbarControls} />}</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => setBlockName(value)} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={attributes.label} onChange={(value) => setAttributes({ label: value })} />
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
						label={__('Choose a block source', 'inseri-core')}
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
				<DropdownInternalView {...props} />
			)}
		</>
	)
}

function DropdownInternalView(props: { attributes: Readonly<Attributes> }) {
	const { attributes } = props
	const { value } = useWatch(attributes.input)
	const dispatch = useDispatch(attributes.output)

	return (
		<Box p="md">
			<Select label={attributes.label} data={value ?? []} onChange={(item) => dispatch({ status: 'ready', value: item })} />
		</Box>
	)
}

export function DropdownView(props: { attributes: Readonly<Attributes> }) {
	return (
		<InseriThemeProvider>
			<DropdownInternalView {...props} />
		</InseriThemeProvider>
	)
}
