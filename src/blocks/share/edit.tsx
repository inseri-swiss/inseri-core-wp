import { InseriRoot } from '@inseri/lighthouse'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow } from '@wordpress/components'
import { Box, SetupEditorEnv, StateProvider, Switch, TextInput, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(_props: BlockEditProps<Attributes>) {
	const { metadata, text, showIcon } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

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
						<TextInput
							mt="md"
							styles={{ root: { width: '100%' } }}
							label="Button Text"
							value={text}
							onChange={(value) => {
								updateState({ text: value.target.value })
							}}
						/>
					</PanelRow>
					<PanelRow>
						<Box mt="md" style={{ width: '100%' }}>
							<Switch
								styles={{ labelWrapper: { width: '100%' } }}
								label="Show Icon"
								checked={showIcon}
								onChange={(event) => updateState({ showIcon: event.target.checked })}
							/>
						</Box>
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
		<SetupEditorEnv {...props} baseBlockName={'share'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(config.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={config.name} clientId={clientId}>
					<EditComponent {...props} />
				</InseriRoot>
			</StateProvider>
		</SetupEditorEnv>
	)
}
