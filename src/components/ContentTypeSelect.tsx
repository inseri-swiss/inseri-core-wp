import { IconLock, IconLockOpen } from '@tabler/icons'
import { __ } from '@wordpress/i18n'
import { COMMON_CONTENT_TYPES } from '../utils'
import { ActionIcon, createStyles, Group, Select } from './'

const useStyles = createStyles((_theme, _params, getRef) => ({
	midSizeField: {
		width: 'calc(100% - 28px)',
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

interface Props {
	isLocked: boolean
	value: string
	update: (val: string) => void
	setLocked: (val: boolean) => void
	withAsterisk?: boolean
}

export function ContentTypeSelect({ value, isLocked, update, setLocked, withAsterisk }: Props) {
	const { midSizeField, ctInputWrapper, lockWrapper } = useStyles().classes

	const foundContentType = COMMON_CONTENT_TYPES.find((c) => c.value === value)
	let contentTypesSelection = COMMON_CONTENT_TYPES

	if (!foundContentType && value) {
		contentTypesSelection = [{ label: value, value }, ...COMMON_CONTENT_TYPES]
	}

	return (
		<Group spacing={0} align={'flex-end'}>
			<Select
				label={__('Content Type', 'inseri-core')}
				placeholder={isLocked ? '' : __('generate with Try Request', 'inseri-core')}
				classNames={{ root: midSizeField, wrapper: ctInputWrapper }}
				styles={{ label: { fontWeight: 'normal' } }}
				searchable
				data={contentTypesSelection}
				value={value}
				readOnly={isLocked}
				onChange={update}
				withAsterisk={withAsterisk}
			/>
			<ActionIcon onClick={() => setLocked(!isLocked)} className={lockWrapper}>
				{isLocked ? <IconLock size={18} /> : <IconLockOpen size={18} />}
			</ActionIcon>
		</Group>
	)
}
