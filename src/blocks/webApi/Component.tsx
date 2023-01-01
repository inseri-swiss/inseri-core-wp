import { useControlTower, useDispatch, useJsonBeacons } from '@inseri/lighthouse'
import { IconApi } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { Button as WPButton, PanelBody, PanelRow, TextControl, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { DetailViewBody } from '../../components/DetailViewBody'
import { Box, DatasourceState, Group, Modal, Select, Text, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'

const stringSchema = {
	type: 'array',
	items: [{ type: 'string' }],
}

const dropdownBeacon = [{ contentType: 'application/json', description: 'data', key: 'data' }]

export function WebApiEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockId, blockName, output, webApiId } = useGlobalState((state: DatasourceState) => state)
	const { name, author } = useGlobalState((state: DatasourceState) => state.heading)
	const { isModalOpen, isWizardMode, datasources } = useGlobalState((state: DatasourceState) => state.block)
	const { updateState, loadDatasources } = useGlobalState((state: DatasourceState) => state.actions)
	const isWebAPIChosen = webApiId !== -1

	const availableBeacons = useJsonBeacons(stringSchema)
	availableBeacons
	const selectData = datasources.map((d) => ({ label: `${d.description} (${d.author_name})`, value: String(d.id) }))

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, dropdownBeacon)

	useEffect(() => {
		loadDatasources()
	}, [])

	useEffect(() => {
		if (producersBeacons.length > 0 && !output.key) {
			updateState({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (isWebAPIChosen && !isSelected && isWizardMode) {
			updateState({ block: { isWizardMode: false } })
		}
	}, [isSelected])

	const toolbarControls = [
		{
			icon: edit,
			isActive: isWizardMode,
			onClick: () => updateState({ block: { isWizardMode: !isWizardMode } }),
			title: __('Edit', 'inseri-core'),
		},
	]
	return (
		<>
			<Modal
				size="90%"
				overlayOpacity={0.7}
				overlayBlur={3}
				opened={isModalOpen}
				onClose={() => updateState({ block: { isModalOpen: false } })}
				styles={{ modal: { background: '#f0f0f1' } }}
				overflow="inside"
				title={
					<Group>
						<Text fz="md" fw="bold">
							{name}
						</Text>{' '}
						<Text fz={14}>({author})</Text>
					</Group>
				}
			>
				<Group spacing={0} grow>
					<DetailViewBody />
				</Group>
			</Modal>
			<BlockControls>{isWebAPIChosen && <ToolbarGroup controls={toolbarControls} />}</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<Box mb="sm">
							<WPButton variant="primary" onClick={() => updateState({ block: { isModalOpen: true } })} disabled={!isWebAPIChosen}>
								{__('Customize the settings', 'inseri-core')}
							</WPButton>
						</Box>
					</PanelRow>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
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
						searchable
						onChange={(key) => updateState({ webApiId: parseInt(key!), block: { isWizardMode: false } })}
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
