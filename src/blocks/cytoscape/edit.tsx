import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconChartDots3 } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, SelectControl, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, SetupEditorEnv, StateProvider, Text, useGlobalState } from '../../components'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
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
]

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { inputKey, blockName, isWizardMode, actions, layout } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!inputKey
	const { updateState } = actions

	const sources = useDiscover({ contentTypeFilter: 'json' })
	const options = sources.map((item) => ({ label: item.description, value: item.key }))

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
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconChartDots3 size={28} />
						<Text ml="xs" fz={24}>
							{__('Cytoscape', 'inseri-core')}
						</Text>
					</Group>

					<Select
						label={__('Display network diagram by selecting a block source', 'inseri-core')}
						data={options}
						value={inputKey}
						onChange={(key) => updateState({ inputKey: key ?? '', isWizardMode: false })}
					/>
				</Box>
			) : (
				<View renderResizable={renderResizable} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'cytoscape'} addSuffixToInputs={['inputKey']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
