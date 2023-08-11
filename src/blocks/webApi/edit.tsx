import { useControlTower, useJsonBeacons, useWatch } from '@inseri/lighthouse'
import { useDebouncedValue } from '@mantine/hooks'
import { IconApi, IconWindowMaximize } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup, Button as WPButton } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import {
	Box,
	Button,
	ContentTypeSelect,
	Group,
	Modal,
	Select,
	SetupEditorEnv,
	Stack,
	StateProvider,
	Text,
	TextInput,
	createStyles,
	getStylesRef,
	useGlobalState,
} from '../../components'
import { DetailViewBody } from '../../components/DetailViewBody'
import { COMMON_CONTENT_TYPES, PERSISTENT_IDS, Z_INDEX_ABOVE_ADMIN } from '../../utils'
import { DatasourceState, datasourceStoreCreator } from './AdminState'
import { default as config, default as json } from './block.json'
import { Attributes } from './index'
import View from './view'

const useStyles = createStyles(() => ({
	pidLeftInputWrapper: {
		[`& > .${getStylesRef('input')}`]: {
			borderTopRightRadius: '0',
			borderBottomRightRadius: '0',
		},
	},
	pidRightInputWrapper: {
		[`& > .${getStylesRef('input')}`]: {
			borderTopLeftRadius: '0',
			borderBottomLeftRadius: '0',
			borderLeftWidth: 0,
		},
	},
}))

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

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const {
		blockId,
		blockName,
		output,
		inputMethodUrl,
		inputQueryParams,
		inputHeadersParams,
		inputBody,
		label,
		isVisible,
		autoTrigger,
		requestParams,
		parameters,
		isContentTypeLock,
		pid,
	} = useGlobalState((state: DatasourceState) => state)
	const { isModalOpen, isWizardMode } = useGlobalState((state: DatasourceState) => state.block)
	const { updateState } = useGlobalState((state: DatasourceState) => state.actions)
	const { url, urlError, isMethodUrlOverridden } = parameters
	const isValueSet = !parameters.urlError && !!requestParams.url && !!output.contentType

	const { pidLeftInputWrapper, pidRightInputWrapper } = useStyles().classes

	const availableUrlBeacons = useJsonBeacons(stringSchema, methodUrlSchema)
	const availableRecordBeacons = useJsonBeacons(recordSchema)
	const availableStringBeacons = useJsonBeacons(stringSchema)

	const methodUrlOptions = Object.entries(availableUrlBeacons).map(([k, { description }]) => ({ label: description, value: k }))
	const recordOptions = Object.entries(availableRecordBeacons).map(([k, { description }]) => ({ label: description, value: k }))
	const bodyOptions = Object.entries(availableStringBeacons).map(([k, { description }]) => ({ label: description, value: k }))

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, baseOutputBeacon)

	const watchMethodUrl = useWatch(inputMethodUrl)
	const watchQueryParams = useWatch(inputQueryParams)
	const watchHeadersParams = useWatch(inputHeadersParams)
	const watchBody = useWatch(inputBody)

	const [debouncedUrl] = useDebouncedValue(url, 500)
	useEffect(() => {
		try {
			if (debouncedUrl) {
				new URL(debouncedUrl)
			}
		} catch (exception) {
			updateState({ parameters: { urlError: __('invalid URL', 'inseri-core') } })
		}
	}, [debouncedUrl])

	useEffect(() => {
		if (producersBeacons.length > 0 && !output.key) {
			updateState({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (watchMethodUrl.status === 'unavailable') {
			updateState({ inputMethodUrl: { ...defaultInput } })
		}
	}, [watchMethodUrl.status])

	useEffect(() => {
		if (watchQueryParams.status === 'unavailable') {
			updateState({ inputQueryParams: { ...defaultInput } })
		}
	}, [watchQueryParams.status])

	useEffect(() => {
		if (watchHeadersParams.status === 'unavailable') {
			updateState({ inputHeadersParams: { ...defaultInput } })
		}
	}, [watchHeadersParams.status])

	useEffect(() => {
		if (watchBody.status === 'unavailable') {
			updateState({ inputBody: { ...defaultInput } })
		}
	}, [watchBody.status])

	return (
		<>
			<Modal
				zIndex={Z_INDEX_ABOVE_ADMIN}
				overlayProps={{ opacity: 0.7, blur: 3 }}
				opened={isModalOpen}
				onClose={() => updateState({ block: { isModalOpen: false } })}
				title={
					<Text fz="md" fw="bold">
						{`Web API${blockName ? ': ' + blockName : ''}`}
					</Text>
				}
			>
				<Group px={1} align="stretch" spacing="lg">
					<Box style={{ flex: 1 }}>
						<DetailViewBody />
					</Box>
					<Stack p="md" style={{ background: '#fff', width: '300px', border: '1px solid #ced4da' }}>
						<ContentTypeSelect
							withAsterisk
							value={output.contentType}
							isLocked={isContentTypeLock}
							update={(val) => updateState({ output: { contentType: val } })}
							setLocked={(isLocked) => updateState({ isContentTypeLock: isLocked })}
						/>

						<Group spacing={0}>
							<Select
								classNames={{ wrapper: pidLeftInputWrapper }}
								styles={{ root: { width: '80px' }, label: { fontWeight: 'normal' } }}
								label={__('PID', 'inseri-core')}
								clearable
								data={PERSISTENT_IDS}
								value={pid.type}
								onChange={(type) => updateState({ pid: { type: type ?? '' } })}
							/>
							<TextInput
								classNames={{ wrapper: pidRightInputWrapper }}
								style={{ flex: 1 }}
								label={__('Identifier', 'inseri-core')}
								value={pid.identifier}
								onChange={(event) => updateState({ pid: { identifier: event.currentTarget.value } })}
							/>
						</Group>

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
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={<IconWindowMaximize style={{ fill: 'none' }} />}
						title={__('Configure the settings', 'inseri-core')}
						onClick={() => {
							updateState({ block: { isModalOpen: !isModalOpen } })
						}}
					/>
				</ToolbarGroup>
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<Box mb="sm">
							<WPButton
								variant="primary"
								icon={<IconWindowMaximize style={{ fill: 'none' }} />}
								onClick={() => {
									updateState({ block: { isModalOpen: true } })
								}}
							>
								{__('Configure the settings', 'inseri-core')}
							</WPButton>
						</Box>
					</PanelRow>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Action Text" value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Show block', 'inseri-core')}
							help={isVisible ? __('Block is visible.', 'inseri-core') : __('Block is invisible.', 'inseri-core')}
							checked={isVisible}
							onChange={(newVisibility) => {
								updateState({ isVisible: newVisibility })
								if (!newVisibility) {
									updateState({ autoTrigger: true })
								}
							}}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Call automatically', 'inseri-core')}
							help={
								autoTrigger
									? __('Web API is called initially and on changes of inputs.', 'inseri-core')
									: __('Web API needs to be called manually.', 'inseri-core')
							}
							checked={autoTrigger}
							onChange={(newTriggerState) => {
								if (isVisible) {
									updateState({ autoTrigger: newTriggerState })
								}
							}}
						/>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Stack p="md" style={{ border: '1px solid #000' }} spacing="sm">
					<Group mb="md" spacing={0}>
						<IconApi size={28} />
						<Text ml="xs" fz={24}>
							{__('Web API', 'inseri-core')}
						</Text>
					</Group>
					<TextInput
						label={__('Enter the URL', 'inseri-core')}
						placeholder={__('URL', 'inseri-core')}
						value={url}
						onChange={(val) => {
							const newVal = val.currentTarget.value
							updateState({ requestParams: { url: newVal }, parameters: { url: newVal, urlError: '' } })
						}}
						error={urlError}
						readOnly={isMethodUrlOverridden}
						withAsterisk
					/>

					<Select
						label={__('Content Type', 'inseri-core')}
						placeholder={__('In which format is the data received?', 'inseri-core')}
						value={output.contentType}
						searchable
						data={COMMON_CONTENT_TYPES}
						onChange={(val) => updateState({ output: { contentType: val ?? '' }, isContentTypeLock: true })}
						withAsterisk
					/>
					<Group position="right">
						<Button
							variant="outline"
							leftIcon={<IconWindowMaximize />}
							onClick={() => {
								updateState({ block: { isWizardMode: false, isModalOpen: true } })
							}}
						>
							{__('Configure the settings', 'inseri-core')}
						</Button>
						<Button
							disabled={!isValueSet}
							variant="filled"
							onClick={() => {
								updateState({ block: { isWizardMode: false } })
							}}
						>
							{__('Finish', 'inseri-core')}
						</Button>
					</Group>
				</Stack>
			) : (
				<View isSelected={isSelected} isGutenbergEditor />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	return (
		<SetupEditorEnv {...props} baseBlockName={'webApi'}>
			<StateProvider
				stateCreator={datasourceStoreCreator}
				initialState={props.attributes}
				keysToSave={Object.keys(json.attributes)}
				setAttributes={props.setAttributes}
			>
				<EditComponent {...props} />
			</StateProvider>
		</SetupEditorEnv>
	)
}