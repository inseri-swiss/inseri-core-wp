import { BaseBeaconState, ConsumerBeacon, useControlTower, useDispatch, useJsonBeacons, useWatch } from '@inseri/lighthouse'
import { IconApi } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { Button as WPButton, PanelBody, PanelRow, TextControl, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { DetailViewBody } from '../../components/DetailViewBody'
import { Box, Button, ContentTypeSelect, DatasourceState, Group, Modal, Select, Stack, Text, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'

const stringSchema = {
	type: 'string',
}

const methodUrlSchema = {
	properties: {
		method: { type: 'string' },
		url: { type: 'string' },
	},
	required: ['method', 'url'],
	additionalProperties: true,
}

const recordSchema = {
	type: 'object',
	additionalProperties: {
		type: 'string',
	},
}

const defaultInput = {
	key: '',
	contentType: '',
	description: '',
}

const baseOutputBeacon = [{ contentType: '', description: 'data', key: 'data' }]

export function WebApiEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockId, blockName, output, webApiId, inputMethodUrl, inputQueryParams, inputHeadersParams, inputBody, isContentTypeLock } = useGlobalState(
		(state: DatasourceState) => state
	)
	const { name, author } = useGlobalState((state: DatasourceState) => state.heading)
	const { isModalOpen, isWizardMode, datasources } = useGlobalState((state: DatasourceState) => state.block)
	const { updateState, loadDatasources } = useGlobalState((state: DatasourceState) => state.actions)
	const isWebAPIChosen = webApiId !== -1

	const availableUrlBeacons = useJsonBeacons(stringSchema, methodUrlSchema)
	const availableRecordBeacons = useJsonBeacons(recordSchema)
	const availableStringBeacons = useJsonBeacons(stringSchema)

	const webApiOptions = datasources.map((d) => ({ label: `${d.description} (${d.author_name})`, value: String(d.id) }))
	const methodUrlOptions = Object.entries(availableUrlBeacons).map(([k, { description }]) => ({ label: description, value: k }))
	const recordOptions = Object.entries(availableRecordBeacons).map(([k, { description }]) => ({ label: description, value: k }))
	const bodyOptions = Object.entries(availableStringBeacons).map(([k, { description }]) => ({ label: description, value: k }))

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, baseOutputBeacon)

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
					<Group pl="md" spacing="xs">
						<Text fz="md" fw="bold">
							{name}
						</Text>
						<Text fz={14}>({author})</Text>
					</Group>
				}
			>
				<Group px={1} align="stretch" spacing="lg">
					<Box style={{ flex: 1 }}>
						<DetailViewBody />
					</Box>
					<Stack p="md" style={{ background: '#fff', width: '300px', border: '1px solid #ced4da' }}>
						<ContentTypeSelect
							value={output.contentType}
							isLocked={isContentTypeLock}
							update={(val) => updateState({ output: { contentType: val } })}
							setLocked={(isLocked) => updateState({ isContentTypeLock: isLocked })}
						/>

						<Select
							styles={{ label: { fontWeight: 'normal' } }}
							label={__('Override method and URL', 'inseri-core')}
							clearable
							data={methodUrlOptions}
							value={inputMethodUrl.key}
							onChange={(key) => updateState({ inputMethodUrl: key ? availableUrlBeacons[key!] : { ...defaultInput } })}
						/>
						<Select
							styles={{ label: { fontWeight: 'normal' } }}
							label={__('Extend query params', 'inseri-core')}
							clearable
							data={recordOptions}
							value={inputQueryParams.key}
							onChange={(key) => updateState({ inputQueryParams: key ? availableRecordBeacons[key!] : { ...defaultInput } })}
						/>
						<Select
							styles={{ label: { fontWeight: 'normal' } }}
							label={__('Extend headers', 'inseri-core')}
							clearable
							data={recordOptions}
							value={inputHeadersParams.key}
							onChange={(key) => updateState({ inputHeadersParams: key ? availableRecordBeacons[key!] : { ...defaultInput } })}
						/>
						<Select
							styles={{ label: { fontWeight: 'normal' } }}
							label={__('Override body', 'inseri-core')}
							clearable
							data={bodyOptions}
							value={inputBody.key}
							onChange={(key) => updateState({ inputBody: key ? availableStringBeacons[key!] : { ...defaultInput } })}
						/>
					</Stack>
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
						data={webApiOptions}
						value={String(webApiId)}
						searchable
						onChange={(key) => updateState({ webApiId: parseInt(key!), block: { isWizardMode: false } })}
					/>
				</Box>
			) : (
				<WebApiView />
			)}
		</>
	)
}

const isBeaconReady = (beacon: ConsumerBeacon, val: BaseBeaconState) => (beacon.key && val.status === 'ready') || !beacon.key

export function WebApiView() {
	const { inputMethodUrl, inputQueryParams, inputHeadersParams, inputBody, item, output } = useGlobalState((state: DatasourceState) => state)
	const { overrideMethodUrl, overrideQueryParams, overrideHeaderParams, overrideBody, fireRequest, loadDatasourceById } = useGlobalState(
		(state: DatasourceState) => state.actions
	)

	const dispatch = useDispatch(output)

	const initDownload = async () => {
		dispatch({ status: 'loading' })

		const [errorMsg, data] = await fireRequest()

		if (errorMsg) {
			dispatch({ status: 'error' })
		} else {
			dispatch({ status: 'ready', value: data })
		}
	}

	const isLoaded = !!item

	const watchMethodUrl = useWatch(inputMethodUrl)
	const watchQueryParams = useWatch(inputQueryParams)
	const watchHeadersParams = useWatch(inputHeadersParams)
	const watchBody = useWatch(inputBody)

	const isDownloadReady =
		isBeaconReady(inputMethodUrl, watchMethodUrl) &&
		isBeaconReady(inputQueryParams, watchQueryParams) &&
		isBeaconReady(inputHeadersParams, watchHeadersParams) &&
		isBeaconReady(inputBody, watchBody)

	useEffect(() => {
		loadDatasourceById()
	}, [])

	useEffect(() => {
		dispatch({ contentType: output.contentType })
	}, [output.contentType])

	useEffect(() => {
		if (watchMethodUrl.status === 'ready') {
			if (typeof watchMethodUrl.value === 'object') {
				overrideMethodUrl(watchMethodUrl.value.method, watchMethodUrl.value.url)
			} else {
				overrideMethodUrl(undefined, watchMethodUrl.value)
			}
		}

		if (!inputMethodUrl.key) {
			overrideMethodUrl(undefined, undefined)
		}
	}, [watchMethodUrl.status, watchMethodUrl.value, inputMethodUrl.key, isLoaded])

	useEffect(() => {
		if (watchQueryParams.status === 'ready') {
			overrideQueryParams(watchQueryParams.value)
		}

		if (!inputQueryParams.key) {
			overrideQueryParams(undefined)
		}
	}, [watchQueryParams.status, watchQueryParams.value, inputQueryParams.key, isLoaded])

	useEffect(() => {
		if (watchHeadersParams.status === 'ready') {
			overrideHeaderParams(watchHeadersParams.value)
		}

		if (!inputHeadersParams.key) {
			overrideHeaderParams(undefined)
		}
	}, [watchHeadersParams.status, watchHeadersParams.value, inputHeadersParams.key, isLoaded])

	useEffect(() => {
		if (watchBody.status === 'ready') {
			overrideBody(watchBody.value)
		}

		if (!inputBody.key) {
			overrideBody(undefined)
		}
	}, [watchBody.status, watchBody.value, inputBody.key, isLoaded])

	return (
		<Box p="md">
			<Button variant="filled" disabled={!isDownloadReady} onClick={initDownload}>
				Download
			</Button>
		</Box>
	)
}
