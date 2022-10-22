import { useDebouncedValue } from '@mantine/hooks'
import { IconCircleOff } from '@tabler/icons'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Accordion, Alert, Box, Button, CodeEditor, createStyles, Group, SegmentedControl, Select, Tabs, Text, TextInput, Title } from '../components'
import { formatCode, getPropertyCaseInsensitive, mapObjectToParams, mapParamsToObject } from '../utils'
import { addNewItem, Datasource, DatasourceWithoutId, fireRequest, getItem } from './ApiServer'
import { PAGES } from './config'
import { ParamItem, ParamsTable } from './ParamsTable'
import { UrlBar } from './UrlBar'
import logo from '../assets/inseri_logo.png'

const useStyles = createStyles((theme, _params, getRef) => ({
	primaryBtn: {
		fontWeight: 'bold',
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

			['&:hover, &:focus']: {
				border: '1px solid #8c8f94',
				boxShadow: 'none',
			},
		},
	},
}))

interface EditProps {
	mode: 'edit'
	itemId: number
}

interface CreateProps {
	mode: 'create'
}

type Props = CreateProps | EditProps

const DATASOURCE_TYPES = [{ label: __('General', 'inseri-core'), value: 'general' }]
const BODY_TYPES = [
	{ label: __('None', 'inseri-core'), value: 'none' },
	{ label: 'Text', value: 'text' },
	{ label: 'XML', value: 'xml' },
	{ label: 'JSON', value: 'json' },
	{ label: 'Form-Urlencoded', value: 'form-urlencoded' },
	{ label: 'Form-Data', value: 'form-data' },
]

const BODY_TYPE_TO_CONTENT_TYPE: any = {
	none: null,
	text: 'text/plain',
	json: 'application/json',
	xml: 'application/xml',
	'form-urlencoded': 'application/x-www-form-urlencoded',
	'form-data': 'multipart/form-data',
}

const RESPONSE_AREA_ID = 'response-textarea'
const CONTENT_TYPE = 'content-type'

const isFormType = (type: string) => ['form-urlencoded', 'form-data'].some((i) => i === type)
const isBeautifyType = (type: string) => ['xml', 'json'].some((i) => i === type)
const createParamItem = () => ({ isChecked: true, key: '', value: '' })

export function DetailView(props: Props) {
	const { primaryBtn, titleBar, whiteBox, accordionContent, accordionLabel, tab, alertRoot, midSizeField, idField, readonlyWrapper } = useStyles().classes
	const { mode } = props
	const isEdit = mode === 'edit'

	const [datasourceName, setDatasourceName] = useState('')
	const [datasourceType, setDatasourceType] = useState<string | null>(DATASOURCE_TYPES[0].value)

	const [method, setMethod] = useState('GET')
	const [url, setUrl] = useState('')
	const [debouncedUrl] = useDebouncedValue(url, 500)
	const [urlError, setUrlError] = useState('')

	const [queryParams, setQueryParams] = useState<ParamItem[]>([createParamItem()])
	const [headerParams, setHeaderParams] = useState<ParamItem[]>([createParamItem()])

	const [requestBodyType, setRequestBodyType] = useState<string>(BODY_TYPES[0].value)
	const [requestTextBody, setRequestTextBody] = useState<string>('')
	const [requestParamsBody, setRequestParamsBody] = useState<ParamItem[]>([createParamItem()])
	const [bodyError, setBodyError] = useState<string>('')

	const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['request'])
	const [isLoadingRequest, setLoadingRequest] = useState(false)

	const [responseStatus, setResponseStatus] = useState<string>('')
	const [responseHeaders, setResponseHeaders] = useState<ParamItem[]>([])
	const [responseBody, setResponseBody] = useState<string>('')
	const [responseBodyType, setResponseBodyType] = useState<string>('')

	const [pageError, setPageError] = useState<string>('')
	const [item, setItem] = useState<Datasource | null>(null)

	const isNotReadyForSubmit = !!urlError || !url || !datasourceName

	const tryRequest = async () => {
		setLoadingRequest(true)

		let body: any = null
		if (requestBodyType === 'form-urlencoded') {
			body = new URLSearchParams(mapParamsToObject(requestParamsBody))
		}
		if (requestBodyType === 'form-data') {
			const bodyFormData = new FormData()
			const paramsObject = mapParamsToObject(requestParamsBody)
			Object.keys(paramsObject).forEach((k) => bodyFormData.append(k, paramsObject[k]))

			body = bodyFormData
		}
		if (requestBodyType === 'json' || requestBodyType === 'xml') {
			body = requestTextBody
		}

		const [status, headers, data] = await fireRequest(method, url, mapParamsToObject(queryParams), mapParamsToObject(headerParams), body)

		const isResponsePanelOpen = openAccordionItems.some((i) => i === 'response')
		if (!isResponsePanelOpen) {
			setOpenAccordionItems([...openAccordionItems, 'response'])
		}

		setResponseStatus(status)
		const responseHeadersParams: ParamItem[] = Object.keys(headers).map((key) => ({ isChecked: true, key, value: headers[key] ?? '' }))
		setResponseHeaders(responseHeadersParams)

		const contentType: string | undefined = getPropertyCaseInsensitive(headers, 'content-type')
		let bodyType = 'text'
		if (contentType?.includes('application/json')) {
			bodyType = 'json'
		}

		if (contentType?.includes('xml')) {
			bodyType = 'xml'
		}

		const [_error, formattedCode] = formatCode(bodyType, data)
		setResponseBody(formattedCode ?? data)
		setResponseBodyType(bodyType)
		setLoadingRequest(false)
	}

	const createDatasource = async () => {
		const newItem: DatasourceWithoutId = {
			method,
			url,
			description: datasourceName,
			headers: JSON.stringify(mapParamsToObject(headerParams)),
			query_params: JSON.stringify(mapParamsToObject(queryParams)),
			type: datasourceType ?? DATASOURCE_TYPES[0].value,
		}

		const [errorMsg, _] = await addNewItem(newItem)
		if (errorMsg) {
			setPageError(errorMsg)
		} else {
			const currentUrl = new URL(window.location.href)
			currentUrl.searchParams.set('page', PAGES.home)
			window.location.href = currentUrl.toString()
		}
	}

	const beautify = () => {
		const [errorMsg, formattedCode] = formatCode(requestBodyType, requestTextBody)

		const error = errorMsg ?? ''
		setBodyError(error)

		if (formattedCode) {
			setRequestTextBody(formattedCode)
		}
	}

	useEffect(() => {
		let updatedHeaders = headerParams.filter((i) => !i.isPreset && i.key !== CONTENT_TYPE)

		if (requestBodyType !== 'none') {
			const defaultEntry = { isPreset: true, isChecked: true, key: CONTENT_TYPE, value: '' }
			const contentType = headerParams.find((i) => i.isPreset && i.key === CONTENT_TYPE) ?? defaultEntry
			const updatedContentType = { ...contentType, value: BODY_TYPE_TO_CONTENT_TYPE[requestBodyType] }

			updatedHeaders = [updatedContentType, ...updatedHeaders]
		}

		setHeaderParams(updatedHeaders)
	}, [requestBodyType])

	useEffect(() => {
		const responseTextarea = document.getElementById(RESPONSE_AREA_ID)
		responseTextarea?.setAttribute('readonly', 'true')

		if (mode === 'edit') {
			getItem(props.itemId).then(([errorMsg, data]) => {
				if (errorMsg) {
					setPageError(errorMsg)
				}
				if (data) {
					const { description, url, method, headers, query_params, type, body } = data
					setItem(data)

					setDatasourceName(description)
					setUrl(url)
					setMethod(method)
					setDatasourceType(type)
					const queryParams = [...mapObjectToParams(JSON.parse(query_params)), createParamItem()]
					setQueryParams(queryParams)

					const headerParams: ParamItem[] = [...mapObjectToParams(JSON.parse(headers)), createParamItem()]
					const contentTypeItem = headerParams.find((i) => i.key.toLowerCase() === CONTENT_TYPE)
					if (contentTypeItem) {
						contentTypeItem.isPreset = true
					}

					setHeaderParams(headerParams)
				}
			})
		}
	}, [])

	useEffect(() => {
		try {
			if (debouncedUrl) {
				new URL(debouncedUrl)
			}
		} catch (exception) {
			setUrlError(__('invalid URL', 'inseri-core'))
		}
	}, [debouncedUrl])

	const title = isEdit ? __('Edit Data Source', 'inseri-core') : __('Add New Data Source', 'inseri-core')
	const primaryBtnText = isEdit ? __('Save', 'inseri-core') : __('Create', 'inseri-core')

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

					<Button classNames={{ root: primaryBtn }} size="sm" disabled={isNotReadyForSubmit} onClick={createDatasource}>
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
						onClose={() => setPageError('')}
						withCloseButton
					>
						{pageError}
					</Alert>
				)}

				<Group px={36} mt="md" spacing="xs">
					{isEdit && <TextInput label={__('ID', 'inseri-core')} readOnly classNames={{ root: idField, wrapper: readonlyWrapper }} value={item?.id} />}

					<TextInput
						label={__('Name', 'inseri-core')}
						className={midSizeField}
						style={{ flex: 1 }}
						value={datasourceName}
						onChange={(e) => setDatasourceName(e.currentTarget.value)}
						withAsterisk
					/>
					<Select
						label={__('Type', 'inseri-core')}
						data={DATASOURCE_TYPES}
						value={datasourceType}
						onChange={setDatasourceType}
						classNames={{ root: midSizeField, wrapper: isEdit ? readonlyWrapper : undefined }}
						readOnly={isEdit}
					/>

					{isEdit && (
						<TextInput label={__('Author', 'inseri-core')} readOnly classNames={{ root: midSizeField, wrapper: readonlyWrapper }} value={item?.author_name} />
					)}
				</Group>
			</Box>

			<Box mt="lg" mx={36} className={whiteBox}>
				<UrlBar
					method={method}
					onMethodChange={setMethod}
					url={url}
					onUrlChange={setUrl}
					urlError={urlError}
					setUrlError={setUrlError}
					onTryClick={tryRequest}
					isLoadingRequest={isLoadingRequest}
				/>

				<Accordion
					multiple
					variant="default"
					classNames={{
						label: accordionLabel,
						content: accordionContent,
					}}
					value={openAccordionItems}
					onChange={setOpenAccordionItems}
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
									<ParamsTable items={queryParams} onItemsChange={setQueryParams} />
								</Tabs.Panel>

								<Tabs.Panel value="headers" pt="xs">
									<ParamsTable items={headerParams} onItemsChange={setHeaderParams} />
								</Tabs.Panel>

								<Tabs.Panel value="body" py="sm" px="md">
									<Group position="apart">
										<SegmentedControl value={requestBodyType} onChange={setRequestBodyType} data={BODY_TYPES} />
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
										<ParamsTable items={requestParamsBody} onItemsChange={setRequestParamsBody} />
									) : (
										<Box mt="sm">
											{bodyError && (
												<Text mt="xs" color="red" size="sm">
													{bodyError}
												</Text>
											)}
											<CodeEditor
												type={requestBodyType}
												value={requestTextBody}
												onChange={(val) => {
													setBodyError('')
													setRequestTextBody(val)
												}}
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
									<CodeEditor type={responseBodyType} value={responseBody} onChange={() => {}} textareaId={RESPONSE_AREA_ID} />
								</Tabs.Panel>
							</Tabs>
						</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</Box>
		</>
	)
}
