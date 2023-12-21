import { InseriRoot } from '@inseri/lighthouse'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow } from '@wordpress/components'
import { Group, NumberInput, SegmentedControl, SetupEditorEnv, StateProvider, TextInput, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(_props: BlockEditProps<Attributes>) {
	const { label, blockName, actions, min, max, step } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	return (
		<>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextInput
							styles={{ root: { width: '100%' } }}
							label="Block Name"
							value={blockName}
							onChange={(event) => updateState({ blockName: event.target.value })}
						/>
					</PanelRow>
					<PanelRow>
						<SegmentedControl
							my="md"
							style={{ width: '100%' }}
							data={['Slider', 'Range']}
							onChange={(selected) => updateState({ isRange: selected === 'Range' })}
						/>
					</PanelRow>
					<PanelRow>
						<TextInput
							styles={{ root: { width: '100%' } }}
							label="Label"
							value={label}
							onChange={(event) => {
								updateState({ label: event.target.value })
							}}
						/>
					</PanelRow>
					<PanelRow>
						<Group>
							<NumberInput
								styles={{ root: { flex: 1 } }}
								label="Min"
								value={min}
								onChange={(val) => updateState({ min: val !== '' ? val : min })}
								hideControls
							/>
							<NumberInput
								styles={{ root: { flex: 1 } }}
								label="Max"
								min={min + 1}
								value={max}
								onChange={(val) => updateState({ max: val !== '' ? val : max })}
								hideControls
							/>
							<NumberInput
								styles={{ root: { flex: 1 } }}
								label="Step"
								min={1}
								value={step}
								onChange={(val) => updateState({ step: val !== '' && max - min >= val ? val : step })}
								hideControls
							/>
						</Group>
					</PanelRow>
				</PanelBody>
			</InspectorControls>

			<View />
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'slider'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(config.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={config.name} clientId={clientId}>
					<EditComponent {...props} />
				</InseriRoot>
			</StateProvider>
		</SetupEditorEnv>
	)
}
