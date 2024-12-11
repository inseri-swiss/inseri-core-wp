import { InseriRoot } from '@inseri/lighthouse'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow } from '@wordpress/components'
import { Box, Group, NumberInput, SegmentedControl, Stack, Switch, TextInput, Title } from '../../components'
import { SetupEditorEnv } from '../../components/SetupEditorEnv'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(_props: BlockEditProps<Attributes>) {
	const { label, metadata, step, isRange, valueBoundaries, rangeBoundaries, initialValue, precision, advancedRange } = useGlobalState(
		(state: GlobalState) => state
	)
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
							value={metadata.name}
							onChange={(event) => updateState({ metadata: { name: event.target.value } })}
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
						<Group align="baseline" mt="md">
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
					</PanelRow>
					<PanelRow>
						<Group align="baseline" mt="md" style={{ width: '100%' }}>
							<NumberInput
								styles={{ root: { flex: 1 } }}
								precision={precision}
								label={isRange ? 'Initial Begin' : 'Initial Value'}
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
									label="Initial End"
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
					{isRange && (
						<PanelRow>
							<Stack mt="md" spacing="xs" style={{ width: '100%' }}>
								<Switch
									styles={{ labelWrapper: { flex: 1 } }}
									label="Advanced Range"
									checked={advancedRange}
									onChange={(event) => updateState({ advancedRange: event.currentTarget.checked })}
								/>
								{advancedRange && (
									<Box style={{ display: 'flex', gap: '1rem' }}>
										<NumberInput
											styles={{ root: { flex: 1 } }}
											precision={precision}
											label="Range Min"
											value={minRange}
											onChange={(val) => {
												const updatedBoundaries = [...rangeBoundaries]
												updatedBoundaries[0] = val !== '' && val >= 0 ? val : minRange
												updateState({ rangeBoundaries: updatedBoundaries })
											}}
											error={!(minRange <= maxVal - minVal) && 'too big'}
											hideControls
										/>
										<NumberInput
											styles={{ root: { flex: 1 } }}
											precision={precision}
											label="Range Max"
											value={maxRange}
											onChange={(val) => {
												const updatedBoundaries = [...rangeBoundaries]
												updatedBoundaries[1] = val !== '' && val >= 0 ? val : maxRange
												updateState({ rangeBoundaries: updatedBoundaries })
											}}
											error={!(minRange <= maxRange) && 'max < min'}
											hideControls
										/>
									</Box>
								)}
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
				<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={config.name} clientId={clientId}>
					<EditComponent {...props} />
				</InseriRoot>
			</StateProvider>
		</SetupEditorEnv>
	)
}
