import { createStyles, UnstyledButton, Group, Center, Text } from '@mantine/core'
import { IconSelector, IconChevronDown, IconChevronUp } from '@tabler/icons'

const useStyles = createStyles((theme) => ({
	th: {
		padding: '0 !important',
	},

	control: {
		width: '100%',
		color: 'inherit',
		padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

		'&:hover': {
			backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
		},
	},

	icon: {
		width: 21,
		height: 21,
		borderRadius: 21,
	},
}))

interface ThProps {
	className?: string
	children: React.ReactNode
	reversed: boolean
	sorted: boolean
	onSort(): void
}

export function SortableTh({ className, children, reversed, sorted, onSort }: ThProps) {
	const { classes, cx } = useStyles()
	const Icon = sorted ? (reversed ? IconChevronDown : IconChevronUp) : IconSelector // eslint-disable-line no-nested-ternary

	return (
		<th className={cx(classes.th, className)}>
			<UnstyledButton onClick={onSort} className={classes.control}>
				<Group position="apart">
					<Text size={14}>{children}</Text>
					<Center className={classes.icon}>
						<Icon size={14} stroke={1.5} />
					</Center>
				</Group>
			</UnstyledButton>
		</th>
	)
}
