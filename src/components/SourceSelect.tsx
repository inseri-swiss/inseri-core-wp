import { DiscoveredItem } from '@inseri/lighthouse'
import type { SelectProps } from '@mantine/core'
import { Box, Group, Select, Tabs, Text, createStyles, getStylesRef } from '@mantine/core'
import { useFocusWithin } from '@mantine/hooks'
import { forwardRef } from '@wordpress/element'
import { COMMON_CONTENT_TYPES } from '../utils'

type ItemProps = DiscoveredItem & React.ComponentPropsWithoutRef<'div'>

const useStyles = createStyles(() => ({
	inputWrapper: {
		gap: 0,
		padding: 0,

		[`& > .${getStylesRef('input')}`]: {
			border: 0,
			margin: '1px 0',
		},
		[`& > .${getStylesRef('input')}:focus`]: {
			boxShadow: 'unset',
		},
	},
	item: {
		padding: '1.25rem 0.25rem',
		border: 0,
		borderBottom: '1px solid #e0e0e0',

		[`& > .${getStylesRef('innerItem')}`]: {
			margin: '0 1rem',
		},
	},

	innerItem: {
		ref: getStylesRef('innerItem'),
	},
}))

export const SourceSelectItem = forwardRef<HTMLDivElement, ItemProps>((props: ItemProps, ref) => {
	const { value, label, blockName, contentType, blockType: _bt, blockTitle, icon, ...others } = props
	const contentTypeDescription = COMMON_CONTENT_TYPES.find((c) => c.value === contentType)?.label ?? contentType
	const { classes } = useStyles()

	return (
		<div ref={ref} {...others}>
			<Group noWrap className={classes.innerItem}>
				{icon}
				<div style={{ width: '100%' }}>
					<Group position="apart">
						<Text size="sm" fw={'bold'}>
							{label}
						</Text>
						<Text size="sm" mr="sm">
							{contentTypeDescription}
						</Text>
					</Group>
					<Text size="sm">{blockTitle}</Text>
				</div>
			</Group>
		</div>
	)
})

interface Props extends SelectProps {
	data: DiscoveredItem[]
	selectValue: string | null
	activeTab: string | null
	tabs: string[]
	onSelectChange: (value: string | null) => void
	setActiveTab: (value: string | null) => void
}

export function SourceSelect(props: Props) {
	const { classes } = useStyles()
	const { ref, focused } = useFocusWithin()
	const { data, selectValue, activeTab, tabs, onSelectChange, setActiveTab, ...rest } = props

	return (
		<Select
			{...rest}
			ref={ref}
			data={data}
			value={selectValue}
			itemComponent={SourceSelectItem}
			clearable
			searchable
			onChange={onSelectChange}
			placeholder="Search for blocks, content type, ..."
			classNames={{ wrapper: classes.inputWrapper, item: classes.item }}
			filter={(value, item) => {
				const { label = '', contentType = '', blockTitle = '' } = item
				const contentTypeDescription = COMMON_CONTENT_TYPES.find((c) => c.value === contentType)?.label ?? contentType
				const searchValue = value.trim()

				return (
					label.toLowerCase().includes(searchValue) ||
					contentTypeDescription.toLowerCase().includes(searchValue) ||
					blockTitle.toLowerCase().includes(searchValue)
				)
			}}
			inputContainer={(children) => (
				<Box style={{ border: focused ? '1px solid #1971c2' : '1px solid #8c8f94', borderRadius: '4px' }}>
					<Tabs value={activeTab} onTabChange={setActiveTab} styles={{ tab: { borderWidth: '4px' } }}>
						<Tabs.List>
							{tabs.map((t) => (
								<Tabs.Tab key={t} value={t.replaceAll(' ', '-')}>
									{t}
								</Tabs.Tab>
							))}
						</Tabs.List>
						{children}
					</Tabs>
				</Box>
			)}
		/>
	)
}
