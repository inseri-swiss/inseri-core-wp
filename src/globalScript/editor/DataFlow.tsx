import { InseriRoot, useWatch } from '@inseri/lighthouse'
import { IconBuildingLighthouse } from '@tabler/icons-react'
import { select } from '@wordpress/data'
import { PluginSidebar } from '@wordpress/edit-post'
import { __ } from '@wordpress/i18n'
import { Accordion, Group, Stack, Text, createStyles } from '../../components'

const useStyles = createStyles({
	card: {
		padding: '0.25rem 0.25rem',
		border: '1px solid transparent',
		borderRadius: '3px',
		'&:hover': {
			border: '1px solid var(--wp-admin-theme-color, #007cba)',
		},
	},
})

function SideBar() {
	const { classes } = useStyles()

	//const chartData = useWatch('_root/data-flow', { onNone: () => [], onSome: (nucleus: any) => nucleus.value }) as any[]
	const blocks = useWatch('_root/blocks', {
		onNone: () => [],
		onSome: (nucleus: { value: any[] }) =>
			nucleus.value.map((item) => {
				const block = select('core/blocks').getBlockType(item.blockType)
				return { ...item, title: block.title, icon: block.icon.src }
			}),
	}) as any[]

	return (
		<PluginSidebar name="inseri-core-data-flow" title="inseri Data Flow" isPinnable={true} icon={<IconBuildingLighthouse style={{ fill: 'none' }} />}>
			<Accordion multiple defaultValue={['blocks', 'chart']}>
				<Accordion.Item value="blocks">
					<Accordion.Control>{__('Blocks', 'inseri-core')}</Accordion.Control>
					<Accordion.Panel style={{ height: '40vh', overflow: 'auto', padding: 0 }}>
						<Stack>
							{blocks.map((b) => (
								<Group key={b.id} className={classes.card}>
									{b.icon}
									<div>
										<Text fz="sm" fw={500}>
											{b.blockName}
										</Text>
										<Text fz="xs" c="dimmed">
											{b.title}
										</Text>
									</div>
								</Group>
							))}
						</Stack>
					</Accordion.Panel>
				</Accordion.Item>
				<Accordion.Item value="chart">
					<Accordion.Control>{__('Chart', 'inseri-core')}</Accordion.Control>
					<Accordion.Panel>Bee</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</PluginSidebar>
	)
}

export function DataFlow() {
	return (
		<InseriRoot blockId="__sidebar" blockName="sidebar" blockType="inseri-core/sidebar">
			<SideBar />
		</InseriRoot>
	)
}
