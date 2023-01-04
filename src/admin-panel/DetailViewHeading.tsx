import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import logo from '../assets/inseri_logo.png'
import { Alert, Box, Button, ContentTypeSelect, createStyles, Group, Select, TextInput, Title, useGlobalState } from '../components'
import { DatasourceState } from '../components/AdminState'

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
}))

const DATASOURCE_TYPES = [{ label: __('General', 'inseri-core'), value: 'general' }]

export function DetailViewHeading() {
	const { primaryBtn, titleBar, alertRoot, midSizeField, idField, readonlyWrapper } = useStyles().classes
	const { name, id, author, webApiType, pageError, isSaveLoading } = useGlobalState((state: DatasourceState) => state.heading)

	const mode = useGlobalState((state: DatasourceState) => state.mode)
	const isContentTypeLock = useGlobalState((state: DatasourceState) => state.isContentTypeLock)
	const contentType = useGlobalState((state: DatasourceState) => state.output.contentType)
	const isEdit = mode === 'edit'

	const isNotReadyForSubmit = useGlobalState(({ heading, parameters, output }: DatasourceState) => {
		return !!parameters.urlError || !parameters.url || !heading.name || !output.contentType
	})

	const { updateState, createOrUpdateWebApi, loadDatasourceById } = useGlobalState((state: DatasourceState) => state.actions)

	const title = isEdit ? __('Edit Web API', 'inseri-core') : __('Add New Web API', 'inseri-core')
	const primaryBtnText = isEdit ? __('Save', 'inseri-core') : __('Create', 'inseri-core')

	useEffect(() => {
		loadDatasourceById()
	}, [])

	return (
		<Box>
			<Group px={36} py="md">
				<img src={logo} height="36" alt="inseri logo" />
			</Group>
			<Group px={36} py="sm" position="apart" className={titleBar}>
				<Title order={1} size="h3">
					{title}
				</Title>

				<Button classNames={{ root: primaryBtn }} size="sm" disabled={isNotReadyForSubmit} onClick={createOrUpdateWebApi} loading={isSaveLoading}>
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
						value={id}
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

				<ContentTypeSelect
					value={contentType}
					isLocked={isContentTypeLock}
					update={(val) => updateState({ output: { contentType: val! } })}
					setLocked={(isLocked) => updateState({ isContentTypeLock: isLocked })}
					withAsterisk
				/>

				{isEdit && (
					<TextInput
						label={__('Author', 'inseri-core')}
						readOnly
						classNames={{
							root: midSizeField,
							wrapper: readonlyWrapper,
						}}
						value={author}
					/>
				)}
			</Group>
		</Box>
	)
}
