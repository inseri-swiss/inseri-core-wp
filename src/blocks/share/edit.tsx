import { InseriRoot } from '@inseri/lighthouse'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow } from '@wordpress/components'
import { select } from '@wordpress/data'
import { Box, Group, Switch, TextInput } from '@mantine/core'
import { SetupEditorEnv } from '../../components/SetupEditorEnv'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

const getPermalink = () => select('core/editor').getPermalink()

function EditComponent(_props: BlockEditProps<Attributes>) {
	const { metadata, text, copiedText, showIcon } = useGlobalState((state: GlobalState) => state)
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
						<Group mt="md" styles={{ root: { width: '100%' } }}>
							<TextInput
								styles={{ root: { flex: 1 } }}
								label="Primary Text"
								value={text}
								onChange={(value) => {
									updateState({ text: value.target.value })
								}}
							/>
							<TextInput
								styles={{ root: { flex: 1 } }}
								label="Copied Text"
								value={copiedText}
								onChange={(value) => {
									updateState({ copiedText: value.target.value })
								}}
							/>
						</Group>
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

			<View getPermalink={getPermalink} />
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
