import { useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Accordion, Box, Button, createStyles, Group, Select, Tabs, TextInput, Title } from '../components'
import { Params, ParamsTable } from './ParamsTable'
import { RequestBody } from './RequestBody'
import { UrlBar } from './UrlBar'

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

export function DetailView(_props: Props) {
	const { primaryBtn, titleBar, whiteBox, accordionContent, accordionLabel, tab } = useStyles().classes

	const [method, setMethod] = useState('GET')
	const [url, setUrl] = useState('')
	const [_queryParams, setQueryParams] = useState<Params>({})
	const [_headerParams, setHeaderParams] = useState<Params>({})
	const [_requestBody, setRequestBody] = useState<string | Params>('')
	const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['request'])

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
						<Accordion.Control>Request Parameters</Accordion.Control>
						<Accordion.Panel>
							<Tabs classNames={{ tab }} defaultValue="query-params">
								<Tabs.List>
									<Tabs.Tab value="query-params">{__('Query Params', 'inseri-core')}</Tabs.Tab>
									<Tabs.Tab value="headers">{__('Headers', 'inseri-core')}</Tabs.Tab>
									<Tabs.Tab value="body">{__('Body', 'inseri-core')}</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value="query-params" pt="xs">
									<ParamsTable onChange={setQueryParams} />
								</Tabs.Panel>

								<Tabs.Panel value="headers" pt="xs">
									<ParamsTable onChange={setHeaderParams} />
								</Tabs.Panel>

								<Tabs.Panel value="body" py="sm" px="md">
									<RequestBody onChange={setRequestBody} />
								</Tabs.Panel>
							</Tabs>
						</Accordion.Panel>
					</Accordion.Item>

					<Accordion.Item value="response">
						<Accordion.Control>Response</Accordion.Control>
						<Accordion.Panel>Colors, fonts, shadows and many other parts are customizable to fit your design needs</Accordion.Panel>
					</Accordion.Item>
				</Accordion>
			</Box>
		</>
	)
}
