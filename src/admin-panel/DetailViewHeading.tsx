import { IconLock, IconLockOpen } from '@tabler/icons'
import { __ } from '@wordpress/i18n'
import { COMMON_CONTENT_TYPES } from '../utils'
import logo from '../assets/inseri_logo.png'
import { ActionIcon, Alert, Box, Button, createStyles, Group, Select, TextInput, Title, useGlobalState } from '../components'
import { AdminState } from '../components/AdminState'

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

export function DetailViewHeading() {
	const { primaryBtn, titleBar, alertRoot, midSizeField, idField, readonlyWrapper, ctInputWrapper, lockWrapper } = useStyles().classes
	const { name, id, author, contentType, isContentTypeLock, webApiType, pageError, isSaveLoading } = useGlobalState((state: AdminState) => state.heading)

	const mode = useGlobalState((state: AdminState) => state.mode)
	const isEdit = mode === 'edit'

	const isNotReadyForSubmit = useGlobalState(({ heading, parameters }: AdminState) => {
		return !!parameters.urlError || !parameters.url || !heading.name || !heading.contentType
	})

	const { updateState, createOrUpdateWebApi } = useGlobalState((state: AdminState) => state.actions)

	const title = isEdit ? __('Edit Web API', 'inseri-core') : __('Add New Web API', 'inseri-core')
	const primaryBtnText = isEdit ? __('Save', 'inseri-core') : __('Create', 'inseri-core')

	const foundContentType = COMMON_CONTENT_TYPES.find((c) => c.value === contentType)
	let contentTypesSelection = COMMON_CONTENT_TYPES

	if (!foundContentType && contentType) {
		contentTypesSelection = [{ label: contentType, value: contentType }, ...COMMON_CONTENT_TYPES]
	}

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
						value={author}
					/>
				)}
			</Group>
		</Box>
	)
}
