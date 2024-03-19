import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconChartDots3 } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, SelectControl, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Accordion, Button, Group, SetupEditorEnv, SourceSelect, Stack, StateProvider, Text, useGlobalState } from '../../components'
import json from './block.json'
import flatElementSchema from './flatElementSchema.json'
import groupedElementSchema from './groupedElementSchema.json'
import { Attributes } from './index'
import layoutSchema from './layoutSchema.json'
import { GlobalState, storeCreator } from './state'
import styleSchema from './styleSchema.json'
import View from './view'

const layoutOptions = [
	{ label: 'random', value: 'random' },
	{ label: 'preset', value: 'preset' },
	{ label: 'grid', value: 'grid' },
	{ label: 'circle', value: 'circle' },
	{ label: 'concentric', value: 'concentric' },
	{ label: 'breadthfirst', value: 'breadthfirst' },
	{ label: 'cose', value: 'cose' },
	{ label: 'dagre', value: 'dagre' },
	{ label: 'klay', value: 'klay' },
]

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputKey, blockName, isWizardMode, actions, layout, styleKey, layoutKey } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!inputKey
	const { updateState } = actions

	const [elementTab, setElementTab] = useState<string | null>('All')
	const [styleTab, setStyleTab] = useState<string | null>('All')
	const [layoutTab, setLayoutTab] = useState<string | null>('All')

	const elementSources = useDiscover({ jsonSchemas: elementTab === 'Valid-Config' ? [flatElementSchema, groupedElementSchema] : undefined })
	const styleSources = useDiscover({ jsonSchemas: styleTab === 'Valid-Config' ? [styleSchema] : undefined })
	const layoutSources = useDiscover({ jsonSchemas: layoutTab === 'Valid-Config' ? [layoutSchema] : undefined })

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			showHandle={isSelected}
			enable={{ bottom: true }}
			minHeight={60}
			onResize={(_event, _direction, element) => {
				updateState({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

	return (
		<>
			<BlockControls controls={[]}>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton
							icon={edit}
							title={__('Edit', 'inseri-core')}
							isActive={isWizardMode}
							onClick={() => {
								updateState({ isWizardMode: !isWizardMode })
							}}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<div style={{ width: '100%' }}>
							<SelectControl
								label={__('Layout', 'inseri-core')}
								value={layout}
								onChange={(value) => {
									updateState({ layout: value })
								}}
								options={layoutOptions}
							/>
						</div>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Stack spacing="xs" style={{ border: '1px solid #000' }}>
					<Group pt="md" px="md" mb="sm" spacing={0}>
						<IconChartDots3 size={28} />
						<Text ml="xs" fz={24}>
							{__('Cytoscape', 'inseri-core')}
						</Text>
					</Group>

					<SourceSelect
						px="md"
						label={__('Display network diagram by selecting a block source', 'inseri-core')}
						data={elementSources}
						selectValue={inputKey}
						activeTab={elementTab}
						tabs={['All', 'Valid Config']}
						onSelectChange={(key) => updateState({ inputKey: key ?? '' })}
						setActiveTab={setElementTab}
						withAsterisk
					/>

					<Accordion multiple styles={{ label: { fontSize: '14px' } }}>
						<Accordion.Item value="style">
							<Accordion.Control>{__('Provide custom style', 'inseri-core')}</Accordion.Control>
							<Accordion.Panel>
								<SourceSelect
									data={styleSources}
									selectValue={styleKey}
									activeTab={styleTab}
									tabs={['All', 'Valid Config']}
									onSelectChange={(key) => updateState({ styleKey: key ?? '' })}
									setActiveTab={setStyleTab}
								/>
							</Accordion.Panel>
						</Accordion.Item>
						<Accordion.Item value="layout">
							<Accordion.Control>{__('Provide additional layout config', 'inseri-core')}</Accordion.Control>
							<Accordion.Panel>
								<SourceSelect
									data={layoutSources}
									selectValue={layoutKey}
									activeTab={layoutTab}
									tabs={['All', 'Valid Config']}
									onSelectChange={(key) => updateState({ layoutKey: key ?? '' })}
									setActiveTab={setLayoutTab}
								/>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>

					<Button mx="md" mb="md" disabled={!isValueSet} onClick={() => updateState({ isWizardMode: false })}>
						{__('Display graph', 'inseri-core')}
					</Button>
				</Stack>
			) : (
				<View renderResizable={renderResizable} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'cytoscape'} addSuffixToInputs={['inputKey']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
