import { useDebouncedValue } from '@mantine/hooks'
import { IconCircleOff, IconLock, IconLockOpen } from '@tabler/icons'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import logo from '../assets/inseri_logo.png'
import {
	Accordion,
	ActionIcon,
	Alert,
	Box,
	Button,
	CodeEditor,
	createStyles,
	Group,
	SegmentedControl,
	Select,
	Tabs,
	Text,
	TextInput,
	Title,
	useGlobalState,
} from '../components'
import { COMMON_CONTENT_TYPES, formatCode, isBeautifyType } from '../utils'
import { ParamsTable } from './ParamsTable'
import { AdminState } from './state'
import { UrlBar } from './UrlBar'
import { isFormType } from './utils'

const useStyles = createStyles((theme, _params, getRef) => ({
	primaryBtn: {
		fontWeight: 'bold',
		'&:hover, &:focus, &:active': {
			color: '#fff',
		},
	},
	titleBar: {
		border: '1px solid' + theme.colors.gray[4],
		background: '#fff',
	},
	whiteBox: {
		border: '1px solid' + theme.colors.gray[4],
		background: '#fff',
	},
	accordionLabel: {
		fontWeight: 'bold',
	},
	accordionContent: {
		padding: 0,
	},
	tab: { borderWidth: '4px' },
	alertRoot: {
		borderWidth: '2px',
	},
	midSizeField: {
		minWidth: '180px',
	},
	idField: {
		width: '60px',
	},
	readonlyWrapper: {
		[`& > .${getRef('input')}`]: {
			background: '#F9F9F9',
			cursor: 'text',

			'&:hover, &:focus': {
				border: '1px solid #8c8f94',
				boxShadow: 'none',
			},
		},
	},
	ctInputWrapper: {
		[`& > .${getRef('input')}`]: {
			borderTopRightRadius: '0',
			borderBottomRightRadius: '0',
		},
		[`& > .${getRef('input')}:read-only`]: {
			cursor: 'not-allowed',
		},
	},
	lockWrapper: {
		background: '#fff',
		height: '36px',
		border: '1px solid #8c8f94',
		borderTopLeftRadius: '0',
		borderBottomLeftRadius: '0',
		color: '#868E96',
	},
}))

const DATASOURCE_TYPES = [{ label: __('General', 'inseri-core'), value: 'general' }]
const BODY_TYPES = [
	{ label: __('None', 'inseri-core'), value: 'none' },
	{ label: 'Text', value: 'text' },
	{ label: 'XML', value: 'xml' },
	{ label: 'JSON', value: 'json' },
	{ label: 'Form-Urlencoded', value: 'form-urlencoded' },
	{ label: 'Form-Data', value: 'form-data' },
]

const RESPONSE_AREA_ID = 'response-textarea'

export function DetailView() {
	const {
		primaryBtn,
		titleBar,
		whiteBox,
		accordionContent,
		accordionLabel,
		tab,
		alertRoot,
		midSizeField,
		idField,
		readonlyWrapper,
		ctInputWrapper,
		lockWrapper,
	} = useStyles().classes

	const openAccordionItems = useGlobalState((state: AdminState) => state.openAccordionItems)
	const item = useGlobalState((state: AdminState) => state.item)
	const mode = useGlobalState((state: AdminState) => state.mode)
	const isEdit = mode === 'edit'

	const { name, contentType, isContentTypeLock, webApiType, pageError, isLoading } = useGlobalState((state: AdminState) => state.heading)
	const {
		method,
		url,
		urlError,
		queryParams,
		headerParams,
		bodyType: requestBodyType,
		textBody,
		paramsBody,
		bodyError,
	} = useGlobalState((state: AdminState) => state.parameters)
	const {
		status: responseStatus,
		headerParams: responseHeaders,
		body: responseBody,
		bodyType: responseBodyType,
	} = useGlobalState((state: AdminState) => state.response)

	const [debouncedUrl] = useDebouncedValue(url, 500)
	const { updateState, createOrUpdateWebApi, tryRequest, loadData, updateRequestBodyType } = useGlobalState((state: AdminState) => state.actions)
	const isNotReadyForSubmit = !!urlError || !url || !name || !contentType

	const beautify = () => {
		const [errorMsg, formattedCode] = formatCode(requestBodyType, textBody)

		const error = errorMsg ?? ''
		updateState({ parameters: { bodyError: error } })

		if (formattedCode) {
			updateState({ parameters: { textBody: formattedCode } })
		}
	}

	useEffect(() => {
		const responseTextarea = document.getElementById(RESPONSE_AREA_ID)
		responseTextarea?.setAttribute('readonly', 'true')
		loadData()
	}, [])

	useEffect(() => {
		try {
			if (debouncedUrl) {
				new URL(debouncedUrl)
			}
		} catch (exception) {
			updateState({ parameters: { urlError: __('invalid URL', 'inseri-core') } })
		}
	}, [debouncedUrl])

	const title = isEdit ? __('Edit Web API', 'inseri-core') : __('Add New Web API', 'inseri-core')
	const primaryBtnText = isEdit ? __('Save', 'inseri-core') : __('Create', 'inseri-core')

	const foundContentType = COMMON_CONTENT_TYPES.find((c) => c.value === contentType)
	let contentTypesSelection = COMMON_CONTENT_TYPES

	if (!foundContentType && contentType) {
		contentTypesSelection = [{ label: contentType, value: contentType }, ...COMMON_CONTENT_TYPES]
	}

	return (
		<>
			<Box>
				<Group px={36} py="md">
					<img src={logo} height="36" alt="inseri logo" />
				</Group>
				<Group px={36} py="sm" position="apart" className={titleBar}>
					<Title order={1} size="h3">
						{title}
					</Title>

					<Button classNames={{ root: primaryBtn }} size="sm" disabled={isNotReadyForSubmit} onClick={createOrUpdateWebApi}>
						{primaryBtnText}
					</Button>
				</Group>

				{pageError && (
					<Alert
						mt="sm"
						mx={36}
						title={__('An error occurred', 'inseri-core')}
						variant="outline"
						color="red"
						classNames={{ root: alertRoot }}
						onClose={() => updateState({ heading: { pageError: '' } })}
						withCloseButton
					>
						{pageError}
					</Alert>
				)}

				<Group px={36} mt="md" spacing="xs">
					{isEdit && (
						<TextInput
							label={__('ID', 'inseri-core')}
							readOnly
							classNames={{
								root: idField,
								wrapper: readonlyWrapper,
							}}
							value={item?.id ?? ''}
						/>
					)}

					<Select
						label={__('Web API Type', 'inseri-core')}
						data={DATASOURCE_TYPES}
						value={webApiType}
						onChange={(type) => updateState({ heading: { webApiType: type! } })}
						classNames={{ wrapper: isEdit ? readonlyWrapper : undefined }}
						readOnly={isEdit}
						withAsterisk={!isEdit}
					/>

					<TextInput
						label={__('Name', 'inseri-core')}
						className={midSizeField}
						style={{ flex: 1 }}
						value={name}
						onChange={(e) => updateState({ heading: { name: e.currentTarget.value } })}
						withAsterisk
					/>

					<Group spacing={0} align={'flex-end'}>
						<Select
							label={__('Content Type', 'inseri-core')}
							placeholder={isContentTypeLock ? '' : __('generate with Try Request', 'inseri-core')}
							classNames={{ root: midSizeField, wrapper: ctInputWrapper }}
							searchable
							data={contentTypesSelection}
							value={contentType}
							readOnly={isContentTypeLock}
							onChange={(val) => updateState({ heading: { contentType: val! } })}
							withAsterisk
						/>
						<ActionIcon onClick={() => updateState({ heading: { isContentTypeLock: !isContentTypeLock } })} className={lockWrapper}>
							{isContentTypeLock ? <IconLock size={18} /> : <IconLockOpen size={18} />}
						</ActionIcon>
					</Group>

					{isEdit && (
						<TextInput
							label={__('Author', 'inseri-core')}
							readOnly
							classNames={{
								root: midSizeField,
								wrapper: readonlyWrapper,
							}}
							value={item?.author_name ?? ''}
						/>
					)}
				</Group>
			</Box>

			<Box mt="lg" mx={36} className={whiteBox}>
				<UrlBar
					method={method}
					onMethodChange={(val) => updateState({ parameters: { method: val } })}
					url={url}
					onUrlChange={(val) => updateState({ parameters: { url: val } })}
					urlError={urlError}
					setUrlError={(err) => updateState({ parameters: { urlError: err } })}
					onTryClick={tryRequest}
					isLoadingRequest={isLoading}
				/>

				<Accordion
					multiple
					variant="default"
					classNames={{
						label: accordionLabel,
						content: accordionContent,
					}}
					value={openAccordionItems}
					onChange={(items) => updateState({ openAccordionItems: items })}
				>
					<Accordion.Item value="request" defaultChecked={true}>
						<Accordion.Control>{__('Parameters', 'inseri-core')}</Accordion.Control>
						<Accordion.Panel>
							<Tabs classNames={{ tab }} defaultValue="query-params">
								<Tabs.List>
									<Tabs.Tab value="query-params">{__('Query Params', 'inseri-core')}</Tabs.Tab>
									<Tabs.Tab value="headers">{__('Headers', 'inseri-core')}</Tabs.Tab>
									<Tabs.Tab value="body">{__('Body', 'inseri-core')}</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value="query-params" pt="xs">
									<ParamsTable items={queryParams} onItemsChange={(qs) => updateState({ parameters: { queryParams: qs } })} />
								</Tabs.Panel>

								<Tabs.Panel value="headers" pt="xs">
									<ParamsTable items={headerParams} onItemsChange={(hs) => updateState({ parameters: { headerParams: hs } })} />
								</Tabs.Panel>

								<Tabs.Panel value="body" py="sm" px="md">
									<Group position="apart">
										<SegmentedControl
											value={requestBodyType}
											onChange={(bodyType) => {
												updateRequestBodyType(bodyType)
											}}
											data={BODY_TYPES}
										/>
										{isBeautifyType(requestBodyType) && (
											<Button variant="subtle" onClick={beautify}>
												{__('Beautify', 'inseri-core')}
											</Button>
										)}
									</Group>
									{requestBodyType === 'none' ? (
										<Group m="lg">
											<IconCircleOff size={24} color="gray" />
											<Text size="md" color="gray">
												{__('no body', 'inseri-core')}
											</Text>
										</Group>
									) : isFormType(requestBodyType) ? (
										<ParamsTable items={paramsBody} onItemsChange={(val) => updateState({ parameters: { paramsBody: val } })} />
									) : (
										<Box mt="sm">
											{bodyError && (
												<Text mt="xs" color="red" size="sm">
													{bodyError}
												</Text>
											)}
											<CodeEditor
												maxHeight={500}
												type={requestBodyType}
												value={textBody}
												onChange={(val) => updateState({ parameters: { textBody: val, bodyError: '' } })}
											/>
										</Box>
									)}
								</Tabs.Panel>
							</Tabs>
						</Accordion.Panel>
					</Accordion.Item>

					<Accordion.Item value="response">
						<Accordion.Control>{__('Response', 'inseri-core')}</Accordion.Control>
						<Accordion.Panel>
							<Tabs classNames={{ tab }} defaultValue="body">
								<Tabs.List>
									<Tabs.Tab value="headers">{__('Headers', 'inseri-core')}</Tabs.Tab>
									<Tabs.Tab value="body">{__('Body', 'inseri-core')}</Tabs.Tab>
									<Group position="right" style={{ flex: 1 }} px="md" spacing={0}>
										{responseStatus && (
											<>
												<Text size="sm" color="blue" weight="bold">
													<Text component="span" color="gray" weight="normal">
														Status:{' '}
													</Text>
													{responseStatus}
												</Text>
											</>
										)}
									</Group>
								</Tabs.List>

								<Tabs.Panel value="headers" pt="xs">
									<ParamsTable items={responseHeaders} readonly />
								</Tabs.Panel>

								<Tabs.Panel value="body" py="sm" px="md">
									{responseBodyType === 'image' ? (
										<img style={{ maxWidth: '100%' }} src={responseBody} alt={__('response image', 'inseri-core')} />
									) : responseBodyType === 'raw' ? (
										<Button classNames={{ root: primaryBtn }} component="a" href={responseBody.url} download={responseBody.filename}>
											{__('Download File', 'inseri-core')}
										</Button>
									) : (
										<CodeEditor maxHeight={500} type={responseBodyType} value={responseBody} textareaId={RESPONSE_AREA_ID} />
									)}
								</Tabs.Panel>
							</Tabs>
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</Box>
		</>
	)
}
