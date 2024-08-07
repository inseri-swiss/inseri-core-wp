import { InseriRoot } from '@inseri/lighthouse'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow } from '@wordpress/components'
import { select } from '@wordpress/data'
import { useEffect } from '@wordpress/element'
import { disablePostExport, enablePostExport } from '../../ApiServer'
import { SetupEditorEnv, StateProvider, TextInput, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

function EditComponent(_props: BlockEditProps<Attributes>) {
	const { metadata } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	useEffect(() => {
		const postId = select('core/editor').getCurrentPostId()
		enablePostExport(postId)
		updateState({ postId })

		return () => {
			const count = select('core/block-editor').getGlobalBlockCount(config.name)
			if (count === 0) {
				disablePostExport(postId)
			}
		}
	}, [])

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
				</PanelBody>
			</InspectorControls>

			<View />
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'export'}>
			<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(config.attributes)} setAttributes={setAttributes} initialState={attributes}>
				<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={config.name} clientId={clientId}>
					<EditComponent {...props} />
				</InseriRoot>
			</StateProvider>
		</SetupEditorEnv>
	)
}
