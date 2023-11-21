import { InseriRoot, useWatch } from '@inseri/lighthouse'
import { IconBuildingLighthouse } from '@tabler/icons-react'
import { select } from '@wordpress/data'
import { PluginSidebar } from '@wordpress/edit-post'
import { useCallback, useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Accordion, CytoscapeComponent, Group, Stack, Text, UnstyledButton, createStyles } from '../../components'
import { useHover } from '@mantine/hooks'
import { useMap } from 'react-use'

const miniStylesheet = [
	{
		selector: 'node',
		style: {
			'background-color': '#757575',
			'border-color': '#757575',
			'border-width': '4px',
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
	isHovered: {
		border: '1px solid var(--wp-admin-theme-color, #007cba)',
	},
	activeCard: {
		padding: '0.25rem 0.25rem',
		border: '1px solid transparent',
		borderRadius: '3px',
		background: 'var(--wp-admin-theme-color, #007cba)',
		color: '#fff',
	},
})

interface ListItemProps {
	block: { id: string; blockName: string; title: string; icon: any }
	isSelected: boolean
	selectBlockId: (id: string) => void
	isHovered: boolean
	setHovered: (isHovered: boolean) => void
}

function ListItem({ isSelected, block, selectBlockId, setHovered, isHovered }: ListItemProps) {
	const { classes, cx } = useStyles()
	const { hovered, ref } = useHover()

	useEffect(() => {
		setHovered(hovered)
	}, [hovered])

	const computedClassName = isSelected ? classes.activeCard : isHovered ? cx(classes.card, classes.isHovered) : classes.card

	return (
		<UnstyledButton ref={ref as any} className={computedClassName} onClick={() => selectBlockId(block.id)}>
			<Group>
				{block.icon}
				<div>
					<Text fz="sm" fw={500}>
						{block.blockName}
					</Text>
					<Text fz="xs" c={isSelected ? undefined : 'dimmed'}>
						{block.title}
					</Text>
				</div>
			</Group>
		</UnstyledButton>
	)
}

function SideBar() {
	const [openItems, setOpenItems] = useState<string[]>(['blocks', 'chart'])
	const blockHeight = openItems.includes('chart') ? 'calc(50vh - 135px)' : undefined

	const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
	const [hoveredRecord, { set: setHovered, setAll: setAllHovered }] = useMap<Record<string, boolean>>({})
	const onSelectGraph = useCallback((event: any, type: string) => {
		if (type === 'node') {
			setSelectedBlock(event?.id)
		}
	}, [])

	let chartData = useWatch('__root/data-flow', { onNone: () => [], onSome: (nucleus: any) => nucleus.value }) as any[]
	const blocks: any[] =
		useWatch('__root/blocks', {
			onNone: () => [],
			onSome: (nucleus: { value: any[] }) =>
				nucleus.value.map((item) => {
					const block = select('core/blocks').getBlockType(item.blockType)
					return { ...item, title: block.title, icon: block.icon.src }
				}),
		}) ?? []

	chartData = chartData.map((item) => {
		if (item.data?.id?.match(selectedBlock)) {
			return { ...item, style: { 'background-color': '#007cba', 'border-color': '#007cba' } }
		}

		if (hoveredRecord[item.data?.id]) {
			return { ...item, style: { 'border-color': '#424242' } }
		}

		return item
	})

	return (
		<PluginSidebar name="inseri-core-data-flow" title="inseri Data Flow" isPinnable={true} icon={<IconBuildingLighthouse style={{ fill: 'none' }} />}>
			<Accordion multiple value={openItems} onChange={setOpenItems}>
				<Accordion.Item value="blocks">
					<Accordion.Control>{__('Blocks', 'inseri-core')}</Accordion.Control>
					<Accordion.Panel style={{ height: blockHeight, overflow: 'auto', padding: 0 }}>
						<Stack>
							{blocks.map((b) => (
								<ListItem
									key={b.id}
									block={b}
									isSelected={b.id === selectedBlock}
									selectBlockId={setSelectedBlock}
									setHovered={(isHovered) => setHovered(b.id, isHovered)}
									isHovered={hoveredRecord[b.id]}
								/>
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
							onHoverChange={(hoveredDict) => setAllHovered({ ...hoveredRecord, ...hoveredDict })}
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
