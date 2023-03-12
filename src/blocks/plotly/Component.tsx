import { useAvailableBeacons, useWatch } from '@inseri/lighthouse'
import { IconChartBar, IconInfoCircle } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import Plot from 'react-plotly.js'
import { isBeaconReady } from '../../utils'
import { ActionIcon, Box, Button, Group, Select, Stack, Text, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

const defaultInput = {
	key: '',
	contentType: '',
	description: '',
}

const LINK_PLOTLY_DOC = 'https://plotly.com/javascript/reference/index/'

export function PlotlyEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, inputData, inputLayout, inputConfig, isWizardMode, actions, height } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = !!inputData.key

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const availableBeacons = useAvailableBeacons('json')
	const options = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			enable={{ bottom: true }}
			showHandle={isSelected}
			onResize={(_event, _direction, element) => {
				updateState({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

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
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label={__('Block Name', 'inseri-core')} value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<div style={{ width: '100%' }}>
							<TextControl
								label={__('height', 'inseri-core')}
								type="number"
								min={0}
								value={height ?? '0'}
								onChange={(value) => {
									const newVal = parseInt(value)
									updateState({ height: newVal > 0 ? newVal : null })
								}}
								help={__('Set 0 for automatic height adjustment', 'inseri-core')}
							/>
						</div>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Stack p="md" spacing="xs" style={{ border: '1px solid #000' }}>
					<Group mb="sm" spacing={0}>
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
						required
						clearable
						label={__('Choose data', 'inseri-core')}
						data={options}
						value={inputData.key}
						searchable
						onChange={(key) => updateState({ inputData: key ? availableBeacons[key] : defaultInput })}
					/>
					<Select
						clearable
						label={__('Choose layout', 'inseri-core')}
						data={options}
						value={inputLayout.key}
						searchable
						onChange={(key) => updateState({ inputLayout: key ? availableBeacons[key] : defaultInput })}
					/>
					<Select
						clearable
						label={__('Choose config', 'inseri-core')}
						data={options}
						value={inputConfig.key}
						searchable
						onChange={(key) => updateState({ inputConfig: key ? availableBeacons[key] : defaultInput })}
					/>
					<Button disabled={!isValueSet} onClick={() => updateState({ isWizardMode: false })}>
						{__('Display chart', 'inseri-core')}
					</Button>
				</Stack>
			) : (
				<PlotlyView renderResizable={renderResizable} isSelected={isSelected} />
			)}
		</>
	)
}

interface ViewProps {
	renderResizable?: (Component: JSX.Element) => JSX.Element
	isSelected?: boolean
}

export function PlotlyView({ renderResizable }: ViewProps) {
	const { height, inputData, inputLayout, inputConfig } = useGlobalState((state: GlobalState) => state)
	const watchData = useWatch(inputData)
	const watchLayout = useWatch(inputLayout)
	const watchConfig = useWatch(inputConfig)

	const hasInputsError = !(isBeaconReady(inputData, watchData) && isBeaconReady(inputLayout, watchLayout) && isBeaconReady(inputConfig, watchConfig))

	let processedData = watchData.value
	let processedLayout = watchLayout.value
	let processedConfig = watchConfig.value

	if (['ready', 'initial'].every((s) => s !== watchData.status) || !processedData) {
		processedData = {}
	}

	if (['ready', 'initial'].every((s) => s !== watchLayout.status) || !processedLayout) {
		processedLayout = {}
	}

	if (['ready', 'initial'].every((s) => s !== watchConfig.status) || !processedConfig) {
		processedConfig = {}
	}

	processedLayout = { ...processedLayout, autosize: true }
	processedConfig = { ...processedLayout, responsive: true }

	const chart = (
		<Plot data={processedData} layout={processedLayout} config={processedConfig} useResizeHandler={true} style={{ width: '100%', height: '100%' }} />
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
