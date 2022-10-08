import { useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Accordion, Box, Button, createStyles, Group, SegmentedControl, Select, Tabs, TextInput, Title, Text, CodeEditor } from '../components'
import { ParamItem, ParamsTable } from './ParamsTable'
import { UrlBar } from './UrlBar'
import xmlFormatter from 'xml-formatter'
import { IconCircleOff } from '@tabler/icons'

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
const NONE = __('None', 'inseri-core')
const BODY_TYPES = [
	NONE,
	'Text',
	'XML',
	'JSON',
	'form-urlencoded',
	'form-data',
]

const XML_FORMAT_OPTION = {
	collapseContent: true,
	lineSeparator: '\n',
}

const isFormType = (type: string) => ['form-urlencoded', 'form-data'].some((i) => i === type)
const isBeautifyType = (type: string) => ['XML', 'JSON'].some((i) => i === type)

export function DetailView(_props: Props) {
	const { primaryBtn, titleBar, whiteBox, accordionContent, accordionLabel, tab } = useStyles().classes

	const [method, setMethod] = useState('GET')
	const [url, setUrl] = useState('')
	const [queryParams, setQueryParams] = useState<ParamItem[]>([])
	const [headerParams, setHeaderParams] = useState<ParamItem[]>([])

	const [bodyType, setBodyType] = useState<string>(BODY_TYPES[1])
	const [requestTextBody, setRequestTextBody] = useState<string>('')
	const [requestParamsBody, setRequestParamsBody] = useState<ParamItem[]>([])
	const [bodyError, setBodyError] = useState<string>('')

	const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['request'])

	const beautify = () => {
		if (bodyType === 'JSON') {
			try {
				const value = JSON.stringify(JSON.parse(requestTextBody), null, 2)
				setRequestTextBody(value)
			} catch (exception) {
				setBodyError(__('invalid JSON', 'inseri-core'))
			}
		}
		if (bodyType === 'XML') {
			try {
				setRequestTextBody(xmlFormatter(requestTextBody, XML_FORMAT_OPTION))
			} catch (exception) {
				setBodyError(__('invalid XML', 'inseri-core'))
			}
		}
	}

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
				<UrlBar method={method} onMethodChange={setMethod} url={url} onUrlChange={setUrl} />

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
										<SegmentedControl value={bodyType} onChange={setBodyType} data={BODY_TYPES} />
										{isBeautifyType(bodyType) && (
											<Button variant="subtle" onClick={beautify}>
												{__('Beautify', 'inseri-core')}
											</Button>
										)}
									</Group>
									{bodyType === NONE ? (
										<Group m="lg">
											<IconCircleOff size={24} color="gray" />
											<Text size="md" color="gray">
												{__('no body', 'inseri-core')}
											</Text>
										</Group>
									) : isFormType(bodyType) ? (
										<ParamsTable items={requestParamsBody} onItemsChange={setRequestParamsBody} />
									) : (
										<Box mt="sm">
											{bodyError && (
												<Text mt="xs" color="red" size="sm">
													{bodyError}
												</Text>
											)}
											<CodeEditor
												type={bodyType.toLowerCase()}
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
						<Accordion.Panel>Colors, fonts, shadows and many other parts are customizable to fit your design needs</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</Box>
		</>
	)
}
