import { useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Accordion, Box, Button, createStyles, Group, Select, Tabs, TextInput, Title } from '../components'
import { Params, ParamsTable } from './ParamsTable'

const useStyles = createStyles((theme, _params, getRef) => ({
	primaryBtn: {
		fontWeight: 'bold',
	},

	sendBtn: {
		fontWeight: 'bold',
		background: theme.colors.blue[1],
		color: '#0d3459',
	},

	methodRoot: {
		width: '8em',
	},
	methodInput: {
		ref: getRef('method-input'),
	},
	methodWrapper: {
		[`& > .${getRef('method-input')}`]: {
			borderTopRightRadius: 0,
			borderBottomRightRadius: 0,
		},
	},
	urlInput: {
		ref: getRef('url-input'),
	},
	urlWrapper: {
		[`& > .${getRef('url-input')}`]: {
			borderTopLeftRadius: 0,
			borderBottomLeftRadius: 0,
			borderLeftWidth: 0,
		},
	},
	urlRoot: {
		flex: 1,
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

export function DetailView(_props: Props) {
	const {
		primaryBtn,
		sendBtn,
		methodRoot,
		methodInput,
		methodWrapper,
		urlInput,
		urlWrapper,
		urlRoot,
		titleBar,
		whiteBox,
		accordionContent,
		accordionLabel,
		tab,
	} = useStyles().classes
	const [queryParams, setQueryParams] = useState<Params>({})
	const [headerParams, setHeaderParams] = useState<Params>({})
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
					<Select label={__('Type', 'inseri-core')} withAsterisk data={['REST-API']} />
					<TextInput label={__('Name', 'inseri-core')} sx={{ flex: 1 }} withAsterisk />
				</Group>
			</Box>

			<Box mt="lg" mx={36} className={whiteBox}>
				<Group px="md" py="lg">
					<Group spacing={0} style={{ flex: 1 }}>
						<Select
							classNames={{ root: methodRoot, wrapper: methodWrapper, input: methodInput }}
							aria-label={__('Type', 'inseri-core')}
							data={['GET', 'DELETE']}
							size="sm"
						/>
						<TextInput
							classNames={{ root: urlRoot, wrapper: urlWrapper, input: urlInput }}
							aria-label={__('Name', 'inseri-core')}
							placeholder={__('Enter your URL', 'inseri-core')}
							variant="filled"
							size="sm"
						/>
					</Group>
					<Button classNames={{ root: sendBtn }} variant="light" size="sm" uppercase>
						{__('Try Request', 'inseri-core')}
					</Button>
				</Group>

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

								<Tabs.Panel value="body" pt="xs">
									Settings tab content
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
