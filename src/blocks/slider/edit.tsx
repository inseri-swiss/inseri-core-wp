import { InseriRoot } from '@inseri/lighthouse'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow } from '@wordpress/components'
import { Group, NumberInput, SegmentedControl, SetupEditorEnv, Stack, StateProvider, TextInput, Title, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(_props: BlockEditProps<Attributes>) {
	const { label, blockName, actions, step, isRange, valueBoundaries, rangeBoundaries, initialValue } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions
	const [minVal, maxVal] = valueBoundaries
	const [minRange, maxRange] = rangeBoundaries
	const [beginInitial, endInitial] = initialValue

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
						<Stack my="md" spacing={0} style={{ width: '100%' }}>
							<Title mb="xs" fz="sm" fw="normal">
								Type
							</Title>
							<SegmentedControl
								style={{ width: '100%' }}
								data={['Value', 'Range']}
								value={isRange ? 'Range' : 'Value'}
								onChange={(selected) => updateState({ isRange: selected === 'Range' })}
							/>
						</Stack>
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
						<Stack mt="md" spacing="xs" style={{ width: '100%' }}>
							<Title fz="md" fw="bold">
								{isRange ? 'Initial Range' : 'Initial Value'}
							</Title>
							<Group>
								<NumberInput
									styles={{ root: { flex: 1 } }}
									label={isRange ? 'Begin' : 'Value'}
									value={beginInitial}
									min={minVal}
									max={maxVal}
									onChange={(val) => {
										const updated = [...initialValue]
										updated[0] = val !== '' ? val : beginInitial
										updateState({ initialValue: updated })
									}}
									onBlur={() => {
										if (!(endInitial - maxRange <= beginInitial && beginInitial <= endInitial - minRange)) {
											const updated = [...initialValue]
											updated[1] = beginInitial + minRange
											updateState({ initialValue: updated })
										}
									}}
									hideControls
								/>
								{isRange && (
									<NumberInput
										styles={{ root: { flex: 1 } }}
										label="End"
										value={endInitial}
										min={minVal}
										max={maxVal}
										onChange={(val) => {
											const updated = [...initialValue]
											updated[1] = val !== '' ? val : endInitial
											updateState({ initialValue: updated })
										}}
										onBlur={() => {
											if (!(beginInitial + minRange <= endInitial && endInitial <= beginInitial + maxRange)) {
												const updated = [...initialValue]
												updated[0] = beginInitial - minRange
												updateState({ initialValue: updated })
											}
										}}
										hideControls
									/>
								)}
							</Group>
						</Stack>
					</PanelRow>
					<PanelRow>
						<Stack mt="md" spacing="xs">
							<Title fz="md" fw="bold">
								Value
							</Title>
							<Group>
								<NumberInput
									styles={{ root: { flex: 1 } }}
									label="Min"
									value={minVal}
									max={maxVal - step}
									onChange={(val) => {
										const updatedBoundaries = [...valueBoundaries]
										updatedBoundaries[0] = val !== '' ? val : minVal
										updateState({ valueBoundaries: updatedBoundaries })
									}}
									onBlur={() => {
										if (!(minRange <= maxVal - minVal)) {
											updateState({ rangeBoundaries: [step, (maxVal - minVal) / 2] })
										}
									}}
									hideControls
								/>
								<NumberInput
									styles={{ root: { flex: 1 } }}
									label="Max"
									min={minVal + step}
									value={maxVal}
									onChange={(val) => {
										const updatedBoundaries = [...valueBoundaries]
										updatedBoundaries[1] = val !== '' ? val : maxVal
										updateState({ valueBoundaries: updatedBoundaries })
									}}
									onBlur={() => {
										if (!(minRange <= maxVal - minVal)) {
											updateState({ rangeBoundaries: [step, (maxVal - minVal) / 2] })
										}
									}}
									hideControls
								/>
								<NumberInput
									styles={{ root: { flex: 1 } }}
									label="Step"
									min={1}
									value={step}
									onChange={(val) => updateState({ step: val !== '' && maxVal - minVal >= val ? val : step })}
									hideControls
								/>
							</Group>
						</Stack>
					</PanelRow>
					{isRange && (
						<PanelRow>
							<Stack mt="md" spacing="xs">
								<Title fz="md" fw="bold">
									Range
								</Title>
								<Group>
									<NumberInput
										styles={{ root: { flex: 1 } }}
										label="Min"
										value={minRange}
										onChange={(val) => {
											const updatedBoundaries = [...rangeBoundaries]
											updatedBoundaries[0] = val !== '' && val > 0 ? val : minRange
											updateState({ rangeBoundaries: updatedBoundaries })
										}}
										onBlur={() => {
											if (!(minRange <= maxRange)) {
												updateState({ rangeBoundaries: [minRange, minRange] })
											}
										}}
										hideControls
									/>
									<NumberInput
										styles={{ root: { flex: 1 } }}
										label="Max"
										value={maxRange}
										onChange={(val) => {
											const updatedBoundaries = [...rangeBoundaries]
											updatedBoundaries[1] = val !== '' ? val : maxRange
											updateState({ rangeBoundaries: updatedBoundaries })
										}}
										onBlur={() => {
											if (!(minRange <= maxRange)) {
												updateState({ rangeBoundaries: [maxRange, maxRange] })
											}
										}}
										hideControls
									/>
								</Group>
							</Stack>
						</PanelRow>
					)}
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
