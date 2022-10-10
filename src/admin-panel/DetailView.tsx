import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Accordion, Box, Button, createStyles, Group, SegmentedControl, Select, Tabs, TextInput, Title, Text, CodeEditor } from '../components'
import { ParamItem, ParamsTable } from './ParamsTable'
import { UrlBar } from './UrlBar'
import { IconCircleOff } from '@tabler/icons'
import { formatCode, getPropertyCaseInsensitive, mapParamsToObject } from '../utils'
import { fireRequest } from './ApiServer'

const useStyles = createStyles((theme) => ({
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
}))

interface EditProps {
	mode: 'edit'
	itemId: number
}

interface CreateProps {
	mode: 'create'
}

type Props = CreateProps | EditProps

const DATASOURCE_TYPES = ['General']
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

const isFormType = (type: string) => ['form-urlencoded', 'form-data'].some((i) => i === type)
const isBeautifyType = (type: string) => ['XML', 'JSON'].some((i) => i === type)

export function DetailView(_props: Props) {
	const { primaryBtn, titleBar, whiteBox, accordionContent, accordionLabel, tab } = useStyles().classes

	const [method, setMethod] = useState('GET')
	const [url, setUrl] = useState('')
	const [queryParams, setQueryParams] = useState<ParamItem[]>([])
	const [headerParams, setHeaderParams] = useState<ParamItem[]>([{ isChecked: true, key: '', value: '' }])

	const [requestBodyType, setRequestBodyType] = useState<string>(BODY_TYPES[0].value)
	const [requestTextBody, setRequestTextBody] = useState<string>('')
	const [requestParamsBody, setRequestParamsBody] = useState<ParamItem[]>([])
	const [bodyError, setBodyError] = useState<string>('')

	const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['request'])

	const [responseStatus, setResponseStatus] = useState<string>('')
	const [responseHeaders, setResponseHeaders] = useState<ParamItem[]>([])
	const [responseBody, setResponseBody] = useState<string>('')
	const [responseBodyType, setResponseBodyType] = useState<string>('')

	const tryRequest = async () => {
		// TODO validate url
		try {
			let body = null
			if (isFormType(requestBodyType)) {
				body = mapParamsToObject(requestParamsBody)
			} else if (requestBodyType !== 'none') {
				body = requestTextBody
			}

			const { status, statusText, data, headers } = await fireRequest(method, url, mapParamsToObject(queryParams), mapParamsToObject(headerParams), body)

			const isResponsePanelOpen = openAccordionItems.some((i) => i === 'response')
			if (!isResponsePanelOpen) {
				setOpenAccordionItems([...openAccordionItems, 'response'])
			}

			setResponseStatus(`${status} ${statusText}`)
			const responseHeadersParams: ParamItem[] = Object.keys(headers).map((key) => ({ isChecked: true, key, value: headers[key] ?? '' }))
			setResponseHeaders(responseHeadersParams)

			const contentType: string = getPropertyCaseInsensitive(headers, 'content-type')
			let bodyType = ''
			if (contentType.includes('application/json')) {
				bodyType = 'json'
			}

			if (contentType.includes('xml')) {
				bodyType = 'xml'
			}

			const [_error, formattedCode] = formatCode(bodyType, data)
			setResponseBody(formattedCode ?? data)
			setResponseBodyType(bodyType)
		} catch (exception) {
			// TODO handle request failure
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
		let updatedHeaders = headerParams.filter((i) => !i.isPreset && i.key !== 'Content-Type')

		if (requestBodyType !== 'none') {
			const defaultEntry = { isPreset: true, isChecked: true, key: 'Content-Type', value: '' }
			const contentType = headerParams.find((i) => i.isPreset && i.key === 'Content-Type') ?? defaultEntry
			const updatedContentType = { ...contentType, value: BODY_TYPE_TO_CONTENT_TYPE[requestBodyType] }

			updatedHeaders = [updatedContentType, ...updatedHeaders]
		}

		setHeaderParams(updatedHeaders)
	}, [requestBodyType])

	useEffect(() => {
		const responseTextarea = document.getElementById(RESPONSE_AREA_ID)
		responseTextarea?.setAttribute('readonly', 'true')
	}, [])

	return (
		<>
			<Box>
				<Group px={36} py="md">
					Inseri
				</Group>
				<Group px={36} py="sm" position="apart" className={titleBar}>
					<Title order={1} size="h3">
						{__('Add New Data Source', 'inseri-core')}
					</Title>

					<Button classNames={{ root: primaryBtn }} size="sm">
						{__('Create', 'inseri-core')}
					</Button>
				</Group>

				<Group px={36} mt="md">
					<Select label={__('Type', 'inseri-core')} data={DATASOURCE_TYPES} value={DATASOURCE_TYPES[0]} />
					<TextInput label={__('Name', 'inseri-core')} sx={{ flex: 1 }} withAsterisk />
				</Group>
			</Box>

			<Box mt="lg" mx={36} className={whiteBox}>
				<UrlBar method={method} onMethodChange={setMethod} url={url} onUrlChange={setUrl} onTryClick={tryRequest} />

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
