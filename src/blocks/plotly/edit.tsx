import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconChartBar, IconInfoCircle, IconX } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Accordion, ActionIcon, Box, Button, Group, Select, SetupEditorEnv, Stack, StateProvider, Text, useGlobalState } from '../../components'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

const LINK_PLOTLY_DOC = 'https://plotly.com/chart-studio-help/json-chart-schema/'
const MIN_HEIGHT = 100
const EVENTS = [
	{ label: 'click', value: 'onClick' },
	{ label: 'hover', value: 'onHover' },
]

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, inputFull, inputData, inputLayout, inputConfig, isWizardMode, actions, height, outputs } = useGlobalState((state: GlobalState) => state)
	const { updateState, setHeight } = actions

	const isValueSet = !!inputFull
	const [openItems, setOpenItems] = useState<string[]>([])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const sources = useDiscover({ contentTypeFilter: 'json' })
	const options = sources.map((item) => ({ label: item.description, value: item.key }))
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

	const unselectedEvents = EVENTS.filter((e) => outputs.every(([key, _]) => key !== e.value))

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
									if (val) {
										const label = EVENTS.find((e) => e.value === val)?.label ?? ''
										updateState({ outputs: [...outputs, [val, label]] })
									}
								}}
							/>
							{outputs.map(([key, desc]) => (
								<Group key={key} position="apart">
									{desc}
									<ActionIcon
										color="gray"
										onClick={() => {
											updateState({ outputs: outputs.filter((e) => e[0] !== key) })
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
							{__('Plotly Chart', 'inseri-core')}
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
						value={inputFull}
						searchable
						onChange={(key) => updateState({ inputFull: key ?? '' })}
					/>

					<Accordion multiple value={openItems} onChange={setOpenItems} styles={{ label: { fontSize: '14px' } }}>
						<Accordion.Item value="data">
							<Accordion.Control>{__('Override data separately', 'inseri-core')}</Accordion.Control>
							<Accordion.Panel>
								<Select clearable data={options} value={inputData} searchable onChange={(key) => updateState({ inputData: key ?? '' })} />
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item value="layout">
							<Accordion.Control>{__('Override layout separately', 'inseri-core')}</Accordion.Control>
							<Accordion.Panel>
								<Select clearable data={options} value={inputLayout} searchable onChange={(key) => updateState({ inputLayout: key ?? '' })} />
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item value="config">
							<Accordion.Control>{__('Provide config', 'inseri-core')}</Accordion.Control>
							<Accordion.Panel>
								<Select clearable data={options} value={inputConfig} searchable onChange={(key) => updateState({ inputConfig: key ?? '' })} />
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>

					<Button mx="md" mb="md" disabled={!isValueSet} onClick={() => updateState({ isWizardMode: false })}>
						{__('Display chart', 'inseri-core')}
					</Button>
				</Stack>
			) : (
				<View renderResizable={renderResizable} isSelected={isSelected} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'plotly'} addSuffixToInputs={['inputFull', 'inputData', 'inputLayout', 'inputConfig']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
