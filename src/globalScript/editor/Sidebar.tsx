import { InseriRoot, usePublish, useWatch } from '@inseri/lighthouse'
import { useHover } from '@mantine/hooks'
import { IconBuildingLighthouse, IconWindowMaximize } from '@tabler/icons-react'
import { select, useDispatch } from '@wordpress/data'
import { PluginSidebar } from '@wordpress/edit-post'
import { useCallback, useEffect, useRef, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { useMap, usePrevious } from 'react-use'
import {
	Accordion,
	AccordionControlProps,
	ActionIcon,
	Box,
	CytoscapeComponent,
	Group,
	Modal,
	NumberInput,
	NumberInputHandlers,
	SegmentedControl,
	Stack,
	Switch,
	Text,
	UnstyledButton,
	createStyles,
} from '../../components'
import { Z_INDEX_ABOVE_ADMIN } from '../../utils'

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

const largeStylesheet = (fontSize: number) => [
	{
		selector: 'node',
		style: {
			label: 'data(label)',
			'font-size': `${fontSize}px`,
			'background-color': '#11479e',
		},
	},
	{
		selector: 'node:parent',
		style: {
			'background-opacity': 0.1,
		},
	},
	{
		selector: 'edge',
		style: {
			width: 4,
			'target-arrow-shape': 'triangle',
			'line-color': '#9dbaea',
			'target-arrow-color': '#9dbaea',
			'curve-style': 'bezier',
		},
	},
]

const useStyles = createStyles({
	card: {
		padding: '0.25rem 0.25rem',
		border: '2px solid transparent',
		borderRadius: '3px',
		'&:hover': {
			border: '2px solid var(--wp-admin-theme-color, #007cba)',
		},
	},
	isHovered: {
		border: '2px solid var(--wp-admin-theme-color, #007cba)',
	},
	activeCard: {
		padding: '0.25rem 0.25rem',
		border: '2px solid transparent',
		borderRadius: '3px',
		background: 'var(--wp-admin-theme-color, #007cba)',
		color: '#fff',
	},
	modalContent: {
		height: '100%',
		flex: 1,
	},
})

interface ListItemProps {
	block: { id: string; blockName: string; title: string; icon: any }
	isSelected: boolean
	onClick: () => void
	isHovered: boolean
	onHover: (isHovered: boolean) => void
}

function ListItem({ isSelected, block, onClick, onHover, isHovered }: ListItemProps) {
	const { classes, cx } = useStyles()
	const { hovered, ref } = useHover()

	useEffect(() => {
		onHover(hovered)
	}, [hovered])

	const computedClassName = isSelected ? classes.activeCard : isHovered ? cx(classes.card, classes.isHovered) : classes.card

	return (
		<UnstyledButton ref={ref as any} className={computedClassName} onClick={onClick}>
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

function AccordionControl({ onClick, ...rest }: AccordionControlProps & { onClick?: () => void }) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			{onClick ? (
				<ActionIcon w={50} onClick={onClick}>
					<IconWindowMaximize style={{ fill: 'none', color: '#000' }} />
				</ActionIcon>
			) : (
				<Box w={50} />
			)}

			<Accordion.Control pl="xs" {...rest} />
		</Box>
	)
}

function NumberWithControl({ fontSize, setFontSize }: { fontSize: number | ''; setFontSize: (val: number | '') => void }) {
	const handlers = useRef<NumberInputHandlers>()

	return (
		<Group spacing={0}>
			Font Size
			<ActionIcon size={36} variant="transparent" onClick={() => handlers.current?.decrement()}>
				–
			</ActionIcon>
			<NumberInput
				hideControls
				value={fontSize}
				onChange={setFontSize}
				handlersRef={handlers}
				min={4}
				styles={{ input: { width: '56px', height: '36px', textAlign: 'center' } }}
				rightSection={'px'}
			/>
			<ActionIcon size={36} variant="transparent" onClick={() => handlers.current?.increment()}>
				+
			</ActionIcon>
		</Group>
	)
}

function ExtendedView({ isModalOpen, setModalOpen }: { isModalOpen: boolean; setModalOpen: (b: boolean) => void }) {
	const { classes } = useStyles()
	const [mode, setMode] = useState('Simple')
	const [fontSize, setFontSize] = useState<number | ''>(12)

	const chartData = useWatch({ detail: '__root/detailed-data-flow', mini: '__root/data-flow' }, { onNone: () => [], onSome: (nucleus: any) => nucleus.value })
	const elements = mode === 'Detailed' ? chartData.detail : chartData.mini

	return (
		<Modal.Root
			zIndex={Z_INDEX_ABOVE_ADMIN}
			opened={isModalOpen}
			onClose={() => setModalOpen(false)}
			classNames={{ content: classes.modalContent }}
			styles={{
				body: { height: 'calc(100% - 80px)', boxSizing: 'border-box' },
				inner: { boxSizing: 'border-box' },
			}}
		>
			<Modal.Overlay opacity={0.7} blur={3} />
			<Modal.Content>
				<Modal.Header style={{ borderBottom: '2px solid #c1c8cd' }}>
					<Modal.Title>
						<Text fz="md" fw="bold">
							Data Flow
						</Text>
					</Modal.Title>
					<Box mr={'auto'} />
					<NumberWithControl fontSize={fontSize} setFontSize={setFontSize} />
					<SegmentedControl mx="xl" size="lg" data={['Simple', 'Detailed']} value={mode} onChange={setMode} />
					<Modal.CloseButton ml={0} />
				</Modal.Header>
				<Modal.Body>
					<CytoscapeComponent
						elements={elements}
						height={'100%'}
						stylesheet={largeStylesheet(fontSize ? fontSize : 12)}
						layoutName={'dagre'}
						userZoomingEnabled
					/>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}

function SideBar() {
	const [openItems, setOpenItems] = useState<string[]>(['blocks', 'chart'])
	const blockHeight = openItems.includes('chart') ? 'calc(50vh - 135px)' : undefined
	const { toggleBlockHighlight } = useDispatch('core/block-editor')

	const [selectedBlockId, setSelectedBlockId] = useState('')
	const prevSelectedBlockId = usePrevious(selectedBlockId) ?? ''
	const [hoveredRecord, { set: setHovered, setAll: setAllHovered }] = useMap<Record<string, boolean>>({})

	const [isModalOpen, setModalOpen] = useState(false)

	const toggleIfBlockSelected = (id: string) => {
		if (id === selectedBlockId) {
			setSelectedBlockId('')
		} else {
			setSelectedBlockId(id)
		}
	}

	const onSelectGraph = useCallback(
		(event: any, type: string) => {
			if (type === 'node' && event.id) {
				toggleIfBlockSelected(event.id)
			}
		},
		[selectedBlockId]
	)

	const isHidden = useWatch('__root/is-hidden', { onNone: () => false, onSome: (nucleus) => nucleus.value })
	const [publishHidden] = usePublish('is-hidden', 'are blocks hidden')

	let chartData = useWatch('__root/data-flow', { onNone: () => [], onSome: (nucleus: any) => nucleus.value }) as any[]
	const blocks: any[] =
		useWatch('__root/blocks', {
			onNone: () => [],
			onSome: (nucleus: { value: any[] }) =>
				nucleus.value.map((item) => {
					const block = select('core/blocks').getBlockType(item.blockType)
					return { ...item, title: block?.title ?? '', icon: block?.icon?.src }
				}),
		}) ?? []

	chartData = chartData.map((item) => {
		if (item.data?.id === selectedBlockId) {
			return { ...item, style: { 'background-color': '#007cba', 'border-color': '#007cba' } }
		}

		if (hoveredRecord[item.data?.id]) {
			return { ...item, style: { 'border-color': '#424242' } }
		}

		return item
	})

	useEffect(() => {
		const found = blocks.find((b) => (!!selectedBlockId ? b.id === selectedBlockId : b.id === prevSelectedBlockId))
		if (found?.clientId) {
			toggleBlockHighlight(found.clientId, !!selectedBlockId)
		}
	}, [selectedBlockId])

	return (
		<>
			<ExtendedView isModalOpen={isModalOpen} setModalOpen={setModalOpen} />
			<PluginSidebar name="inseri-core-sidebar" title="inseri" isPinnable={true} icon={<IconBuildingLighthouse style={{ fill: 'none' }} />}>
				<Box p="md" style={{ border: '0.0625rem solid #dee2e6' }}>
					<Switch
						label="Hide the invisible blocks"
						value={isHidden}
						onChange={(event) => {
							publishHidden(event.currentTarget.checked, 'application/json')
						}}
					/>
				</Box>

				<Accordion chevronPosition="right" multiple value={openItems} onChange={setOpenItems}>
					<Accordion.Item value="blocks">
						<AccordionControl>{__('inseri Blocks', 'inseri-core')}</AccordionControl>
						<Accordion.Panel style={{ height: blockHeight, overflow: 'auto', padding: 0 }}>
							<Stack>
								{blocks.map((b) => (
									<ListItem
										key={b.id}
										block={b}
										isSelected={b.id === selectedBlockId}
										onClick={() => toggleIfBlockSelected(b.id)}
										onHover={(isHovered) => setHovered(b.id, isHovered)}
										isHovered={hoveredRecord[b.id]}
									/>
								))}
							</Stack>
						</Accordion.Panel>
					</Accordion.Item>
					<Accordion.Item value="chart">
						<AccordionControl onClick={() => setModalOpen(true)}>{__('Data Flow Chart', 'inseri-core')}</AccordionControl>
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
		</>
	)
}

export function InseriSidebar() {
	return (
		<InseriRoot blockId="__root" blockName="core" blockType="inseri-core/root">
			<SideBar />
		</InseriRoot>
	)
}
