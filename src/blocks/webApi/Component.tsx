import { useControlTower, useDispatch, useJsonBeacons } from '@inseri/lighthouse'
import { IconApi } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { Button as WPButton, PanelBody, PanelRow, TextControl, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { DetailViewBody } from '../../components/DetailViewBody'
import { Datasource, getAllItems } from '../../ApiServer'
import { Box, Group, Modal, Select, Text } from '../../components'
import config from './block.json'
import { Attributes } from './index'

const stringSchema = {
	type: 'array',
	items: [{ type: 'string' }],
}

const dropdownBeacon = [{ contentType: 'application/json', description: 'data', key: 'data' }]

export function WebApiEdit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, isSelected } = props
	const { blockId, blockName, output, webApiId } = attributes

	const [isModalOpen, setModalOpen] = useState(false)
	const [isWizardMode, setWizardMode] = useState(true)
	const [datasources, setDatasources] = useState<Datasource[]>([])

	const availableBeacons = useJsonBeacons(stringSchema)
	availableBeacons
	const selectData = datasources.map((d) => ({ label: d.description, value: String(d.id) }))

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, dropdownBeacon)

	useEffect(() => {
		getAllItems().then(([_, data]) => {
			if (data) {
				setDatasources(data)
			}
		})
	}, [])

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
			{webApiId && (
				<Modal size="90%" overlayOpacity={0.7} overlayBlur={3} opened={isModalOpen} onClose={() => setModalOpen(false)}>
					<Group spacing={0}>
						<DetailViewBody />
					</Group>
				</Modal>
			)}
			<BlockControls>{<ToolbarGroup controls={toolbarControls} />}</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<Box mb="sm">
							<WPButton variant="primary" onClick={() => setModalOpen(true)}>
								{__('Customize the settings', 'inseri-core')}
							</WPButton>
						</Box>
					</PanelRow>
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
					<Select
						label={__('Choose a base Web API', 'inseri-core')}
						data={selectData}
						value={String(webApiId)}
						onChange={(key) => setAttributes({ webApiId: parseInt(key!) })}
					/>
				</Box>
			) : (
				<WebApiView {...props} />
			)}
		</>
	)
}

export function WebApiView(props: { attributes: Readonly<Attributes> }) {
	const { attributes } = props
	useDispatch(attributes.output)

	return <Box p="md">PlaceHolder</Box>
}
