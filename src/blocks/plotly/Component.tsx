import { BaseBeaconState, ConsumerBeacon, RecordUpdater, useAvailableBeacons, useControlTower, useDispatchMany, useWatch } from '@inseri/lighthouse'
import { IconChartBar, IconInfoCircle, IconX } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import Plot from 'react-plotly.js'
import { isBeaconReady } from '../../utils'
import { Accordion, ActionIcon, Box, Button, Group, Select, Stack, Text, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'
import blockConfig from './block.json'
import cloneDeep from 'lodash.clonedeep'
import stringify from 'json-stable-stringify'

const defaultInput = {
	key: '',
	contentType: '',
	description: '',
}

const LINK_PLOTLY_DOC = 'https://plotly.com/chart-studio-help/json-chart-schema/'
const MIN_HEIGHT = 100
const EVENTS = [
	{ label: 'click', value: 'onClick' },
	{ label: 'hover', value: 'onHover' },
]

export function PlotlyEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, inputFull, inputData, inputLayout, inputConfig, isWizardMode, actions, height, outputs } = useGlobalState((state: GlobalState) => state)
	const { updateState, setHeight } = actions

	const isValueSet = !!inputFull.key
	const [openItems, setOpenItems] = useState<string[]>([])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const availableBeacons = useAvailableBeacons('json')
	const options = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))
	const resizerHeight = height ? height : 'auto'

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			size={{ height: resizerHeight, width: 'auto' }}
			enable={{ bottom: true }}
			showHandle={isSelected}
			onResize={(_event, _direction, element) => {
				const newHeight = element.offsetHeight
				if (newHeight >= MIN_HEIGHT) {
					setHeight(newHeight)
				}
			}}
		>
			{children}
		</ResizableBox>
	)

	const selectedEvents = outputs.map((b) => b.description)
	const unselectedEvents = EVENTS.filter((e) => !selectedEvents.includes(e.value))

	return (
		<>
			<BlockControls>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton
							icon={edit}
							isActive={isWizardMode}
							onClick={() => {
								updateState({ isWizardMode: !isWizardMode })
							}}
							title={__('Edit', 'inseri-core')}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls>
				<PanelBody>
					<PanelRow>
						<TextControl label={__('Block Name', 'inseri-core')} value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<div style={{ width: '100%' }}>
							<TextControl
								label={__('height', 'inseri-core')}
								type="number"
								min={MIN_HEIGHT}
								value={height}
								onChange={(value) => {
									const newVal = parseInt(value)
									if (newVal >= MIN_HEIGHT) {
										setHeight(newVal)
									}
								}}
							/>
						</div>
					</PanelRow>
				</PanelBody>

				<PanelBody title={__('Events', 'inseri-core')}>
					<PanelRow>
						<Stack style={{ width: '100%' }}>
							<Select
								placeholder={__('Add event to emit', 'inseri-core')}
								data={unselectedEvents}
								onChange={(val) => {
									updateState({ outputs: [...outputs, { contentType: 'application/json', description: val!, key: val! }] })
								}}
							/>
							{selectedEvents.map((item) => (
								<Group key={item} position="apart">
									{EVENTS.find((e) => e.value === item)?.label ?? item}
									<ActionIcon
										color="gray"
										onClick={() => {
											updateState({ outputs: outputs.filter((e) => e.description !== item) })
										}}
									>
										<IconX size={12} />
									</ActionIcon>
								</Group>
							))}
						</Stack>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Stack spacing="xs" style={{ border: '1px solid #000' }}>
					<Group pt="md" px="md" mb="sm" spacing={0}>
						<IconChartBar size={28} />
						<Text ml="xs" fz={24}>
							{__('Plotly.js', 'inseri-core')}
						</Text>
						<Box ml="xs">
							<ActionIcon component="a" href={LINK_PLOTLY_DOC} target="_blank" title={__('more info', 'inseri-core')}>
								<IconInfoCircle size={20} style={{ color: '#5C5F66' }} />
							</ActionIcon>
						</Box>
					</Group>

					<Select
						px="md"
						required
						clearable
						label={__('Provide full JSON description', 'inseri-core')}
						data={options}
						value={inputFull.key}
						searchable
						onChange={(key) => updateState({ inputFull: key ? availableBeacons[key] : defaultInput })}
					/>

					<Accordion multiple value={openItems} onChange={setOpenItems} styles={{ label: { fontSize: '14px' } }}>
						<Accordion.Item value="data">
							<Accordion.Control>{__('Override data separately', 'inseri-core')}</Accordion.Control>
							<Accordion.Panel>
								<Select
									clearable
									data={options}
									value={inputData.key}
									searchable
									onChange={(key) => updateState({ inputData: key ? availableBeacons[key] : defaultInput })}
								/>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item value="layout">
							<Accordion.Control>{__('Override layout separately', 'inseri-core')}</Accordion.Control>
							<Accordion.Panel>
								<Select
									clearable
									data={options}
									value={inputLayout.key}
									searchable
									onChange={(key) => updateState({ inputLayout: key ? availableBeacons[key] : defaultInput })}
								/>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item value="config">
							<Accordion.Control>{__('Provide config', 'inseri-core')}</Accordion.Control>
							<Accordion.Panel>
								<Select
									clearable
									data={options}
									value={inputConfig.key}
									searchable
									onChange={(key) => updateState({ inputConfig: key ? availableBeacons[key] : defaultInput })}
								/>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>

					<Button mx="md" mb="md" disabled={!isValueSet} onClick={() => updateState({ isWizardMode: false })}>
						{__('Display chart', 'inseri-core')}
					</Button>
				</Stack>
			) : (
				<PlotlyView renderResizable={renderResizable} isSelected={isSelected} />
			)}
		</>
	)
}

const simpleEventTransform = (event: Plotly.PlotHoverEvent | Plotly.PlotHoverEvent | Plotly.PlotSelectionEvent) => {
	return event.points.map(({ curveNumber, data, x, y, pointIndex }) => ({ curveNumber, data, x, y, pointIndex }))
}

const propagateIfSet = (eventType: string, outputs: ConsumerBeacon[], recordUpdater: RecordUpdater) => (val: any) => {
	const isSet = outputs.some((o) => o.description === eventType)
	if (isSet && recordUpdater[eventType]) {
		let processedVal = val

		if (eventType === 'onClick' || eventType === 'onHover') {
			processedVal = simpleEventTransform(val)
		}

		recordUpdater[eventType]({ status: 'ready', value: processedVal })
	}
}

const useDefaultIfNotReady = (beacon: BaseBeaconState, defaultVal: any) => {
	if (['ready', 'initial'].every((s) => s !== beacon.status) || !beacon.value) {
		return defaultVal
	}

	return beacon.value
}

interface ViewProps {
	renderResizable?: (Component: JSX.Element) => JSX.Element
	isSelected?: boolean
}

export function PlotlyView({ renderResizable }: ViewProps) {
	const { height, inputFull, inputData, inputLayout, inputConfig, blockId, blockName, outputs, revision } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const [frames, setFrames] = useState<any>([])
	const [data, setData] = useState<any>([])
	const [layout, setLayout] = useState<any>({})
	const [config, setConfig] = useState<any>({})

	const producersBeacons = useControlTower({ blockId, blockType: blockConfig.name, instanceName: blockName }, outputs)
	const joinedKeys = outputs.reduce((acc, b) => acc + b.key, '')

	useEffect(() => {
		updateState({ outputs: producersBeacons })
	}, [producersBeacons.length, joinedKeys])

	const dispatchRecord = useDispatchMany(producersBeacons)

	const watchFull = useWatch(inputFull)
	const watchData = useWatch(inputData)
	const watchLayout = useWatch(inputLayout)
	const watchConfig = useWatch(inputConfig)

	const hasInputsError = !(
		isBeaconReady(inputFull, watchFull) &&
		isBeaconReady(inputData, watchData) &&
		isBeaconReady(inputLayout, watchLayout) &&
		isBeaconReady(inputConfig, watchConfig)
	)

	const processedFull = useDefaultIfNotReady(watchFull, { data: [], layout: {} })
	const processedData = useDefaultIfNotReady(watchData, [])
	const processedLayout = useDefaultIfNotReady(watchLayout, {})
	const processedConfig = useDefaultIfNotReady(watchConfig, {})

	const strFull = stringify(processedFull)
	const strData = stringify(processedData)
	const strLayout = stringify(processedLayout)
	const strConfig = stringify(processedConfig)

	const setLayoutWithExtra = (newLayout: any) => {
		const { width, height, ...rest } = newLayout
		setLayout(cloneDeep({ ...rest, autosize: true }))
	}

	useEffect(() => {
		setData(cloneDeep(processedData))
	}, [strData])

	useEffect(() => {
		setLayoutWithExtra(processedLayout)
	}, [strLayout])

	useEffect(() => {
		setConfig(cloneDeep({ ...processedConfig, responsive: true }))
	}, [strConfig])

	useEffect(() => {
		if (processedFull.data && processedData.length === 0) {
			setData(cloneDeep(processedFull.data))
		}
		if (processedFull.layout && Object.keys(processedLayout).length === 0) {
			setLayoutWithExtra(processedFull.layout)
		}
	}, [strFull, strData, strLayout])

	const chart = (
		<Plot
			revision={revision}
			frames={frames}
			data={data}
			layout={layout}
			config={config}
			useResizeHandler={true}
			style={{ width: '100%', height: '100%' }}
			onInitialized={(f) => {
				setData(f.data)
				setLayout(f.layout)
				setFrames(f.frames)
			}}
			onUpdate={(f) => {
				setData(f.data)
				setLayout(f.layout)
				setFrames(f.frames)
			}}
			// events
			onClick={propagateIfSet('onClick', outputs, dispatchRecord)}
			onHover={propagateIfSet('onHover', outputs, dispatchRecord)}
		/>
	)

	return (
		<Box style={{ height: height ?? 'auto' }}>
			{hasInputsError && (
				<Text fz={14} color="red">
					{__('Not all inputs are ready!', 'inseri-core')}
				</Text>
			)}
			{renderResizable ? renderResizable(chart) : chart}
		</Box>
	)
}
