import { useControlTower, useDispatch, useJsonBeacons } from '@inseri/lighthouse'
import { IconApi } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, Text } from '../../components'
import config from './block.json'
import { Attributes } from './index'

const stringSchema = {
	type: 'array',
	items: [{ type: 'string' }],
}

const dropdownBeacon = [{ contentType: 'application/json', description: 'data', key: 'data' }]

export function DropdownEdit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, isSelected } = props
	const { blockId, blockName, output } = attributes

	const [isWizardMode, setWizardMode] = useState(false)

	const availableBeacons = useJsonBeacons(stringSchema)
	const selectData = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, dropdownBeacon)

	useEffect(() => {
		if (producersBeacons.length > 0 && !output) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (!isSelected && isWizardMode) {
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
			<BlockControls>{<ToolbarGroup controls={toolbarControls} />}</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => setAttributes({ blockName: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="lg" spacing={0}>
						<IconApi size={28} />
						<Text ml="xs" fz={24}>
							{__('Web API', 'inseri-core')}
						</Text>
					</Group>
					<Select label={__('Choose a base Web API', 'inseri-core')} data={selectData} value={''} onChange={(key) => {}}></Select>
				</Box>
			) : (
				<WebApiView {...props} />
			)}
		</>
	)
}

export function WebApiView(props: { attributes: Readonly<Attributes> }) {
	const { attributes } = props
	const dispatch = useDispatch(attributes.output)

	return <Box p="md">PlaceHolder</Box>
}
