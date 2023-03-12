import { useAvailableBeacons } from '@inseri/lighthouse'
import { IconChartBar } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, Text, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

const defaultInput = {
	key: '',
	contentType: '',
	description: '',
}

export function PlotlyEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, inputData, isWizardMode, actions, height } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = !!inputData.key

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const jsonBeacons = useAvailableBeacons('json')
	const availableBeacons = { ...jsonBeacons }
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
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="lg" spacing={0}>
						<IconChartBar size={28} />
						<Text ml="xs" fz={24}>
							{__('Plotly.js', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Choose data', 'inseri-core')}
						data={options}
						value={inputData.key}
						searchable
						onChange={(key) => updateState({ input: key ? availableBeacons[key] : defaultInput, isWizardMode: false })}
					/>
				</Box>
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
	const { height } = useGlobalState((state: GlobalState) => state)

	return (
		<Box>
			<div
				style={{
					height: height ?? 'auto',
					position: 'relative',
					textAlign: 'center',
				}}
			>
				{renderResizable ? renderResizable(<div />) : <div />}
			</div>
		</Box>
	)
}
