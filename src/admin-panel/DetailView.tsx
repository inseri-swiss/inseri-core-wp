import { __ } from '@wordpress/i18n'
import { Box, Group, TextInput, Title, Select, Button, createStyles, Accordion, Tabs, Table, Checkbox } from '../components'

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

	table: {
		[`& td:nth-child(1)`]: {
			width: '20px',
			paddingLeft: theme.spacing.md,
		},

		[`& td:nth-child(3)`]: {
			width: '60%',
			paddingRight: theme.spacing.md,
		},
	},

	paramInput: {
		ref: getRef('param-input'),
	},
	paramWrapper: {
		[`& > .${getRef('param-input')}`]: {
			border: 'none',
			['&:focus']: {
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

export function DetailView(_props: Props) {
	const { primaryBtn, sendBtn, methodRoot, methodInput, methodWrapper, urlInput, urlWrapper, urlRoot, table, paramInput, paramWrapper } = useStyles().classes

	return (
		<>
			<Box>
				<Group px={36} py="md">
					Inseri
				</Group>
				<Group px={36} py="sm" position="apart" sx={(theme) => ({ border: '1px solid' + theme.colors.gray[4], background: '#fff' })}>
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

			<Box
				mt="lg"
				mx={36}
				sx={(theme) => ({
					border: '1px solid' + theme.colors.gray[4],
					background: '#fff',
				})}
			>
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
					styles={(_theme) => ({
						label: {
							fontWeight: 'bold',
						},
						content: {
							padding: 0,
						},
					})}
				>
					<Accordion.Item value="customization">
						<Accordion.Control>Request Parameters</Accordion.Control>
						<Accordion.Panel>
							<Tabs
								styles={{
									tab: {
										borderWidth: '4px',
									},
								}}
								defaultValue="gallery"
							>
								<Tabs.List>
									<Tabs.Tab value="gallery">Query Params</Tabs.Tab>
									<Tabs.Tab value="messages">Headers</Tabs.Tab>
									<Tabs.Tab value="settings">Body</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value="gallery" pt="xs">
									<Table className={table}>
										<thead>
											<tr>
												<th></th>
												<th>Key</th>
												<th>Value</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													<Checkbox color="gray" />
												</td>
												<td>
													<TextInput classNames={{ input: paramInput, wrapper: paramWrapper }} placeholder="key" />
												</td>
												<td>
													<TextInput classNames={{ input: paramInput, wrapper: paramWrapper }} placeholder="value" />
												</td>
											</tr>
										</tbody>
									</Table>
								</Tabs.Panel>

								<Tabs.Panel value="messages" pt="xs">
									Messages tab content
								</Tabs.Panel>

								<Tabs.Panel value="settings" pt="xs">
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
