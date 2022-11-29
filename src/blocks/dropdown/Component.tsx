import { Select, Box, Text, Group, InseriThemeProvider } from '../../components'
import type { BlockEditProps } from '@wordpress/blocks'
import { Attributes } from './index'
import { __ } from '@wordpress/i18n'
import { IconCaretDown } from '@tabler/icons'
import { useJsonBeacons, useDispatch, useControlTower, useWatch } from '@inseri/lighthouse'
import { generateId } from '@inseri/utils'
import { useState, useEffect } from '@wordpress/element'
import { InspectorControls } from '@wordpress/block-editor'
import { PanelBody, PanelRow, TextControl } from '@wordpress/components'

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
	const { setAttributes, attributes } = props
	const [inputKey, setInputkey] = useState('')
	const availableBeacons = useJsonBeacons(objectSchema, stringSchema)
	const selectData = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))

	const [instanceName, setInstanceName] = useState(attributes.name ?? 'dropdown' + generateId(3))

	const producersBeacons = useControlTower({ blockId: attributes.blockId, blockType: 'inseri-core/dropdown', instanceName }, dropdownBeacon)

	useEffect(() => {
		if (producersBeacons.length > 0) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		setAttributes({ name: instanceName })
	}, [instanceName])

	return (
		<>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={instanceName} onChange={(value) => setInstanceName(value)} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{inputKey ? (
				<DropdownInternalView {...props} />
			) : (
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
						value={inputKey}
						onChange={(key) => {
							setInputkey(key!)
							setAttributes({ input: availableBeacons[key!] })
						}}
					></Select>
				</Box>
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
			<Select label={__('Choose an item', 'inseri-core')} data={value ?? []} onChange={(item) => dispatch({ status: 'ready', value: item })} />
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
