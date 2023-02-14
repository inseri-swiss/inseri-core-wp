import { __ } from '@wordpress/i18n'
import { ActionIcon, createStyles, Group, Select, SelectProps } from '.'

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
	iconWrapper: {
		background: '#fff',
		height: '36px',
		border: '1px solid #8c8f94',
		borderTopLeftRadius: '0',
		borderBottomLeftRadius: '0',
		color: '#868E96',
	},
}))

interface Props extends SelectProps {
	onClick: () => void
}

export function SelectWithAction(props: Props) {
	const { midSizeField, ctInputWrapper, iconWrapper } = useStyles().classes
	const { title, icon, onClick, ...selectProps } = props

	return (
		<Group spacing={0} align={'flex-end'}>
			<Select classNames={{ root: midSizeField, wrapper: ctInputWrapper }} styles={{ label: { fontWeight: 'normal' } }} searchable {...selectProps} />
			<ActionIcon onClick={onClick} title={title} className={iconWrapper}>
				{icon}
			</ActionIcon>
		</Group>
	)
}
