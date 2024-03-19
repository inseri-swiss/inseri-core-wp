import { __ } from '@wordpress/i18n'
import { ActionIcon, createStyles, Group, Select, SelectProps, getStylesRef, SourceSelectItem } from '.'
import { COMMON_CONTENT_TYPES } from '../utils'

const useStyles = createStyles((theme) => ({
	midSizeField: {
		width: 'calc(100% - 28px)',
		position: 'relative',
	},
	ctInputWrapper: {
		[`& > .${getStylesRef('input')}`]: {
			borderTopRightRadius: '0',
			borderBottomRightRadius: '0',
			height: '48px',
			paddingTop: 18,
		},
		[`& > .${getStylesRef('input')}:read-only`]: {
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
		paddingTop: `calc(${theme.spacing.sm} / 2)`,
		zIndex: 1,
	},
	item: {
		padding: '1rem 0.25rem',
		border: '0',
		borderBottom: '1px solid #e0e0e0',
	},
}))

interface Props extends SelectProps {
	onClick: () => void
}

export function SourceSelectWithAction(props: Props) {
	const classes = useStyles().classes
	const { title, icon, onClick, ...selectProps } = props

	return (
		<Group spacing={0} align={'flex-end'}>
			<Select
				classNames={{ root: classes.midSizeField, wrapper: classes.ctInputWrapper, label: classes.label, item: classes.item }}
				itemComponent={SourceSelectItem}
				searchable
				filter={(value, item) => {
					const { label = '', blockName = '', contentType = '', blockTitle = '' } = item
					const contentTypeDescription = COMMON_CONTENT_TYPES.find((c) => c.value === contentType)?.label ?? contentType
					const searchValue = value.trim()

					return (
						label.toLowerCase().includes(searchValue) ||
						blockName.toLowerCase().includes(searchValue) ||
						contentTypeDescription.toLowerCase().includes(searchValue) ||
						blockTitle.toLowerCase().includes(searchValue)
					)
				}}
				{...selectProps}
			/>
			<ActionIcon onClick={onClick} title={title} className={classes.iconWrapper}>
				{icon}
			</ActionIcon>
		</Group>
	)
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
