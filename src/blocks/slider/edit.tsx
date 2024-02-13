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
	const { label, blockName, step, isRange, valueBoundaries, rangeBoundaries, initialValue, precision } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
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
						<Stack mt="md" spacing="xs">
							<Title fz="md" fw="bold">
								Value
							</Title>
							<Group align="baseline">
								<NumberInput
									styles={{ root: { flex: 1 } }}
									precision={precision}
									label="Min"
									value={minVal}
									onChange={(val) => {
										const updatedBoundaries = [...valueBoundaries]
										updatedBoundaries[0] = val !== '' ? val : minVal
										updateState({ valueBoundaries: updatedBoundaries })
									}}
									hideControls
								/>
								<NumberInput
									styles={{ root: { flex: 1 } }}
									precision={precision}
									label="Max"
									value={maxVal}
									onChange={(val) => {
										const updatedBoundaries = [...valueBoundaries]
										updatedBoundaries[1] = val !== '' ? val : maxVal
										updateState({ valueBoundaries: updatedBoundaries })
									}}
									error={!(minVal <= maxVal) && 'max < min'}
									hideControls
								/>
								<NumberInput
									styles={{ root: { flex: 1 } }}
									precision={precision}
									label="Step"
									value={step}
									onChange={(val) => updateState({ step: val !== '' && val > 0 ? val : step })}
									error={!(step <= maxVal - minVal) && 'too big'}
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
								<Group align="baseline">
									<NumberInput
										styles={{ root: { flex: 1 } }}
										precision={precision}
										label="Min"
										value={minRange}
										onChange={(val) => {
											const updatedBoundaries = [...rangeBoundaries]
											updatedBoundaries[0] = val !== '' && val > 0 ? val : minRange
											updateState({ rangeBoundaries: updatedBoundaries })
										}}
										error={!(minRange <= maxVal - minVal) && 'too big'}
										hideControls
									/>
									<NumberInput
										styles={{ root: { flex: 1 } }}
										precision={precision}
										label="Max"
										value={maxRange}
										onChange={(val) => {
											const updatedBoundaries = [...rangeBoundaries]
											updatedBoundaries[1] = val !== '' && val > 0 ? val : maxRange
											updateState({ rangeBoundaries: updatedBoundaries })
										}}
										error={!(minRange <= maxRange) && 'max < min'}
										hideControls
									/>
								</Group>
							</Stack>
						</PanelRow>
					)}
					<PanelRow>
						<Stack mt="md" spacing="xs" style={{ width: '100%' }}>
							<Title fz="md" fw="bold">
								{isRange ? 'Initial Range' : 'Initial Value'}
							</Title>
							<Group align="baseline">
								<NumberInput
									styles={{ root: { flex: 1 } }}
									precision={precision}
									label={isRange ? 'Begin' : 'Value'}
									value={beginInitial}
									onChange={(val) => {
										const updated = [...initialValue]
										updated[0] = val !== '' ? val : beginInitial
										updateState({ initialValue: updated })
									}}
									error={(!(minVal <= beginInitial) && 'begin < min') || (!(beginInitial <= maxVal) && 'begin > max')}
									hideControls
								/>
								{isRange && (
									<NumberInput
										styles={{ root: { flex: 1 } }}
										precision={precision}
										label="End"
										value={endInitial}
										onChange={(val) => {
											const updated = [...initialValue]
											updated[1] = val !== '' ? val : endInitial
											updateState({ initialValue: updated })
										}}
										error={
											(!(minVal <= endInitial) && 'end < min') ||
											(!(endInitial <= maxVal) && 'end > max') ||
											(!(beginInitial + minRange <= endInitial) && 'too little of range') ||
											(!(endInitial <= beginInitial + maxRange) && 'too big of range')
										}
										hideControls
									/>
								)}
							</Group>
						</Stack>
					</PanelRow>
					<PanelRow>
						<NumberInput
							mt="md"
							styles={{ root: { width: '100%' } }}
							label="Decimal Places"
							value={precision}
							min={0}
							max={15}
							onChange={(val) => {
								updateState({ precision: val !== '' ? val : precision })
							}}
						/>
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
