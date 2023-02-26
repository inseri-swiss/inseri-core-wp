import { __ } from '@wordpress/i18n'
import { ActionIcon, createStyles, Group, Select, SelectProps } from '.'

const useStyles = createStyles((theme, _params, getRef) => ({
	midSizeField: {
		width: 'calc(100% - 28px)',
		position: 'relative',
	},
	ctInputWrapper: {
		[`& > .${getRef('input')}`]: {
			borderTopRightRadius: '0',
			borderBottomRightRadius: '0',
			height: '48px',
			paddingTop: 18,
		},
		[`& > .${getRef('input')}:read-only`]: {
			cursor: 'not-allowed',
		},
	},
	iconWrapper: {
		background: '#fff',
		height: '48px',
		border: '1px solid #8c8f94',
		borderTopLeftRadius: '0',
		borderBottomLeftRadius: '0',
		color: '#868E96',
	},

	label: {
		fontWeight: 'normal',
		position: 'absolute',
		pointerEvents: 'none',
		fontSize: theme.fontSizes.xs,
		paddingLeft: 10,
		paddingTop: theme.spacing.sm / 2,
		zIndex: 1,
	},
}))

interface Props extends SelectProps {
	onClick: () => void
}

export function SelectWithAction(props: Props) {
	const { midSizeField, ctInputWrapper, iconWrapper, label } = useStyles().classes
	const { title, icon, onClick, ...selectProps } = props

	return (
		<Group spacing={0} align={'flex-end'}>
			<Select classNames={{ root: midSizeField, wrapper: ctInputWrapper, label }} searchable {...selectProps} />
			<ActionIcon onClick={onClick} title={title} className={iconWrapper}>
				{icon}
			</ActionIcon>
		</Group>
	)
}
