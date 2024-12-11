import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { useDebouncedValue } from '@mantine/hooks'
import { IconApi, IconWindowMaximize } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup, Button as WPButton } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { useMap } from 'react-use'
import { Box, Button, Group, Modal, Select, SetupEditorEnv, SourceSelect, Stack, Text, TextInput, createStyles, getStylesRef } from '../../components'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import { ContentTypeSelect } from '../../components/ContentTypeSelect'
import { DetailViewBody } from '../../components/DetailViewBody'
import { COMMON_CONTENT_TYPES, HidingWrapper, PERSISTENT_IDS, Z_INDEX_ABOVE_ADMIN } from '../../utils'
import { DatasourceState, datasourceStoreCreator } from './AdminState'
import json from './block.json'
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

const urlSchema = {
	$ref: '#/definitions/URL',
	definitions: {
		URL: { type: 'string', format: 'uri', pattern: '^https?://' },
	},
}

const methodUrlSchema = {
	properties: {
		method: { type: 'string' },
		url: { $ref: '#/definitions/URL' },
	},
	required: ['method', 'url'],
	additionalProperties: true,
	definitions: {
		URL: { type: 'string', format: 'uri', pattern: '^https?://' },
	},
}

const recordSchema = {
	type: 'object',
	additionalProperties: {
		type: 'string',
	},
}

const customSelectStyle: any = {
	label: { fontWeight: 'normal' },
	item: {
		[`& > .${getStylesRef('innerItem')}`]: {
			margin: '0 !important',
		},
	},
}

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const {
		metadata,
		outputContenType,
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
	const isValueSet = !parameters.urlError && !!requestParams.url && !!outputContenType
	const blockName = metadata.name

	const { pidLeftInputWrapper, pidRightInputWrapper } = useStyles().classes

	const [tabMap, tabAction] = useMap<Record<string, string | null>>({
		methodUrl: 'Valid-Config',
		queryParams: 'Attributes',
		headersParams: 'Attributes',
		body: 'Text',
	})

	const allOptions = useDiscover({})
	const methodUrlOptions = useDiscover({ jsonSchemas: [urlSchema, methodUrlSchema] })
	const recordOptions = useDiscover({ jsonSchemas: [recordSchema] })
	const bodyOptions = useDiscover({ jsonSchemas: [stringSchema] })

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

	const renderHiding = (children: JSX.Element) => (
		<HidingWrapper isSelected={isSelected} isVisible={isVisible}>
			{children}
		</HidingWrapper>
	)

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
							value={outputContenType}
							isLocked={isContentTypeLock}
							update={(val) => updateState({ outputContenType: val })}
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

						<SourceSelect
							styles={customSelectStyle}
							label={__('Override method and URL', 'inseri-core')}
							data={tabMap.methodUrl === 'Valid-Config' ? methodUrlOptions : allOptions}
							selectValue={inputMethodUrl}
							tabs={['Valid Config', 'All']}
							activeTab={tabMap.methodUrl}
							onSelectChange={(key) => updateState({ inputMethodUrl: key ?? '' })}
							setActiveTab={(key) => tabAction.set('methodUrl', key)}
						/>
						<SourceSelect
							styles={customSelectStyle}
							label={__('Extend query params', 'inseri-core')}
							data={tabMap.queryParams === 'Attributes' ? recordOptions : allOptions}
							selectValue={inputQueryParams}
							tabs={['Attributes', 'All']}
							activeTab={tabMap.queryParams}
							onSelectChange={(key) => updateState({ inputQueryParams: key ?? '' })}
							setActiveTab={(key) => tabAction.set('queryParams', key)}
						/>
						<SourceSelect
							styles={customSelectStyle}
							label={__('Extend headers', 'inseri-core')}
							data={tabMap.headersParams === 'Attributes' ? recordOptions : allOptions}
							selectValue={inputHeadersParams}
							tabs={['Attributes', 'All']}
							activeTab={tabMap.headersParams}
							onSelectChange={(key) => updateState({ inputHeadersParams: key ?? '' })}
							setActiveTab={(key) => tabAction.set('headersParams', key)}
						/>
						<SourceSelect
							styles={customSelectStyle}
							label={__('Override body', 'inseri-core')}
							data={tabMap.body === 'Text' ? bodyOptions : allOptions}
							selectValue={inputBody}
							tabs={['Text', 'All']}
							activeTab={tabMap.body}
							onSelectChange={(key) => updateState({ inputBody: key ?? '' })}
							setActiveTab={(key) => tabAction.set('body', key)}
						/>
					</Stack>
				</Group>
			</Modal>
			<BlockControls controls={[]}>
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
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ metadata: { name: value } })} />
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
						value={outputContenType}
						searchable
						data={COMMON_CONTENT_TYPES}
						onChange={(val) => updateState({ outputContenType: val ?? '', isContentTypeLock: true })}
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
				<View renderHiding={renderHiding} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'webApi'} addSuffixToInputs={['inputMethodUrl', 'inputQueryParams', 'inputHeadersParams', 'inputBody']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={json.name} clientId={clientId}>
				<StateProvider
					stateCreator={datasourceStoreCreator}
					initialState={props.attributes}
					keysToSave={Object.keys(json.attributes)}
					setAttributes={props.setAttributes}
				>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
