import { useDebouncedValue } from '@mantine/hooks'
import { IconCircleOff } from '@tabler/icons-react'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Accordion, Alert, Box, Button, CodeEditor, createStyles, Group, SegmentedControl, Tabs, Text, useGlobalState } from '.'
import { formatCode, isBeautifyType, isFormType } from '../utils'
import { ParamsTable } from './ParamsTable'
import { DatasourceState } from '../blocks/webApi/AdminState'
import { UrlBar } from './UrlBar'

const useStyles = createStyles((theme) => ({
	primaryBtn: {
		fontWeight: 'bold',
		'&:hover, &:focus, &:active': {
			color: '#fff',
		},
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

const BODY_TYPES = [
	{ label: __('None', 'inseri-core'), value: 'none' },
	{ label: 'Text', value: 'text' },
	{ label: 'XML', value: 'xml' },
	{ label: 'JSON', value: 'json' },
	{ label: 'Form-Urlencoded', value: 'form-urlencoded' },
	{ label: 'Form-Data', value: 'form-data' },
]

export function DetailViewBody() {
	const { primaryBtn, whiteBox, accordionContent, accordionLabel, tab } = useStyles().classes

	const openAccordionItems = useGlobalState((state: DatasourceState) => state.openAccordionItems)
	const { pageError } = useGlobalState((state: DatasourceState) => state.heading)
	const {
		method,
		url,
		queryParams,
		headerParams,
		bodyType: requestBodyType,
		paramsBody,
		urlError,
		bodyError,
		isTryLoading,
		isMethodUrlOverridden,
		isHeaderParamsOverridden,
		isQueryParamsOverridden,
		isBodyOverridden,
	} = useGlobalState((state: DatasourceState) => state.parameters)
	const textBody = useGlobalState((state: DatasourceState) => decodeURIComponent(state.parameters.textBody))
	const { status, headerParams: responseHeaders, body: responseBody, bodyType: responseBodyType } = useGlobalState((state: DatasourceState) => state.response)

	const [debouncedUrl] = useDebouncedValue(url, 500)
	const { updateState, tryRequest, updateRequestBodyType } = useGlobalState((state: DatasourceState) => state.actions)

	const beautify = () => {
		const [errorMsg, formattedCode] = formatCode(requestBodyType, textBody)

		const error = errorMsg ?? ''
		updateState({ parameters: { bodyError: error } })

		if (formattedCode) {
			updateState({ requestParams: { textBody: encodeURIComponent(formattedCode) } })
		}
	}

	let bodyTypes = BODY_TYPES
	if (isBodyOverridden) {
		bodyTypes = bodyTypes.map((bt) => {
			if (bt.value !== requestBodyType) {
				return { ...bt, disabled: true }
			}

			return bt
		})
	}

	useEffect(() => {
		try {
			if (debouncedUrl) {
				new URL(debouncedUrl)
			}
		} catch (exception) {
			updateState({ parameters: { urlError: __('invalid URL', 'inseri-core') } })
		}
	}, [debouncedUrl])

	return (
		<div className={whiteBox}>
			{pageError && (
				<Alert
					mt="sm"
					mx="md"
					title={__('An error occurred', 'inseri-core')}
					variant="outline"
					color="red"
					onClose={() => updateState({ heading: { pageError: '' } })}
					withCloseButton
				>
					{pageError}
				</Alert>
			)}
			<UrlBar
				method={method}
				onMethodChange={(val) => updateState({ requestParams: { method: val }, parameters: { method: val } })}
				url={url}
				onUrlChange={(val) => updateState({ requestParams: { url: val }, parameters: { url: val } })}
				urlError={urlError}
				setUrlError={(err) => updateState({ parameters: { urlError: err } })}
				onTryClick={tryRequest}
				isLoadingRequest={isTryLoading}
				readonly={isMethodUrlOverridden}
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
								<ParamsTable
									items={queryParams}
									readonly={isQueryParamsOverridden}
									onItemsChange={(qs) => {
										updateState({ requestParams: { queryParams: qs }, parameters: { queryParams: qs } })
									}}
								/>
							</Tabs.Panel>

							<Tabs.Panel value="headers" pt="xs">
								<ParamsTable
									items={headerParams}
									readonly={isHeaderParamsOverridden}
									onItemsChange={(hs) => {
										updateState({ requestParams: { headerParams: hs }, parameters: { headerParams: hs } })
									}}
								/>
							</Tabs.Panel>

							<Tabs.Panel value="body" py="sm" px="md">
								<Group position="apart">
									<SegmentedControl
										value={requestBodyType}
										onChange={(bodyType) => {
											updateRequestBodyType(bodyType)
										}}
										data={bodyTypes}
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
									<ParamsTable
										items={paramsBody}
										onItemsChange={(val) => {
											updateState({ requestParams: { paramsBody: val }, parameters: { paramsBody: val } })
										}}
									/>
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
											onChange={(val) => {
												if (!isBodyOverridden) {
													updateState({
														requestParams: { textBody: encodeURIComponent(val) },
														parameters: { bodyError: '', textBody: val },
													})
												}
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
									{status && (
										<>
											<Text size="sm" color="blue" weight="bold">
												<Text component="span" color="gray" weight="normal">
													Status:{' '}
												</Text>
												{status}
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
									<CodeEditor maxHeight={500} type={responseBodyType} value={responseBody} />
								)}
							</Tabs.Panel>
						</Tabs>
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</div>
	)
}
