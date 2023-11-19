import { InseriRoot, useWatch } from '@inseri/lighthouse'
import { IconBuildingLighthouse } from '@tabler/icons-react'
import { select } from '@wordpress/data'
import { PluginSidebar } from '@wordpress/edit-post'
import { useCallback, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Accordion, CytoscapeComponent, Group, Stack, Text, UnstyledButton, createStyles } from '../../components'

const miniStylesheet = [
	{
		selector: 'node',
		style: {
			'background-color': '#757575',
		},
	},
	{
		selector: 'edge',
		style: {
			width: 4,
			'target-arrow-shape': 'triangle',
			'line-color': '#bdbdbd',
			'target-arrow-color': '#bdbdbd',
			'curve-style': 'bezier',
		},
	},
]

const useStyles = createStyles({
	card: {
		padding: '0.25rem 0.25rem',
		border: '1px solid transparent',
		borderRadius: '3px',
		'&:hover': {
			border: '1px solid var(--wp-admin-theme-color, #007cba)',
		},
	},
	activeCard: {
		padding: '0.25rem 0.25rem',
		border: '1px solid transparent',
		borderRadius: '3px',
		background: 'var(--wp-admin-theme-color, #007cba)',
		color: '#fff',
	},
})

function SideBar() {
	const { classes } = useStyles()
	const [openItems, setOpenItems] = useState<string[]>(['blocks', 'chart'])
	const blockHeight = openItems.includes('chart') ? 'calc(50vh - 135px)' : undefined

	const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
	const onSelectGraph = useCallback((event: any, type: string) => {
		if (type === 'node') {
			setSelectedBlock(event?.id)
		}
	}, [])

	let chartData = useWatch('_root/data-flow', { onNone: () => [], onSome: (nucleus: any) => nucleus.value }) as any[]
	const blocks: any[] =
		useWatch('_root/blocks', {
			onNone: () => [],
			onSome: (nucleus: { value: any[] }) =>
				nucleus.value.map((item) => {
					const block = select('core/blocks').getBlockType(item.blockType)
					return { ...item, title: block.title, icon: block.icon.src }
				}),
		}) ?? []

	chartData = chartData.map((item) => (item.data?.id?.match(selectedBlock) ? { ...item, style: { 'background-color': '#007cba' } } : item))

	return (
		<PluginSidebar name="inseri-core-data-flow" title="inseri Data Flow" isPinnable={true} icon={<IconBuildingLighthouse style={{ fill: 'none' }} />}>
			<Accordion multiple value={openItems} onChange={setOpenItems}>
				<Accordion.Item value="blocks">
					<Accordion.Control>{__('Blocks', 'inseri-core')}</Accordion.Control>
					<Accordion.Panel style={{ height: blockHeight, overflow: 'auto', padding: 0 }}>
						<Stack>
							{blocks.map((b) => (
								<UnstyledButton
									key={b.id}
									className={b.id === selectedBlock ? classes.activeCard : classes.card}
									onClick={() => {
										setSelectedBlock(b.id)
									}}
								>
									<Group>
										{b.icon}
										<div>
											<Text fz="sm" fw={500}>
												{b.blockName}
											</Text>
											<Text fz="xs" c={b.id !== selectedBlock ? 'dimmed' : undefined}>
												{b.title}
											</Text>
										</div>
									</Group>
								</UnstyledButton>
							))}
						</Stack>
					</Accordion.Panel>
				</Accordion.Item>
				<Accordion.Item value="chart">
					<Accordion.Control>{__('Chart', 'inseri-core')}</Accordion.Control>
					<Accordion.Panel>
						<CytoscapeComponent
							elements={chartData}
							height={'calc(50vh - 135px)'}
							stylesheet={miniStylesheet}
							layoutName={'dagre'}
							onSelect={onSelectGraph}
						></CytoscapeComponent>
					</Accordion.Panel>
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
