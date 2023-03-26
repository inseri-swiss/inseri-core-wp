import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl } from '@wordpress/components'
import { __ } from '@wordpress/i18n'
import { useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

export function FileDropEdit(_props: BlockEditProps<Attributes>) {
	const { blockName, actions } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	return (
		<>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label={__('Block Name', 'inseri-core')} value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<FileDropView />
		</>
	)
}

export function FileDropView() {
	//const {  } = useGlobalState((state: GlobalState) => state)
	//const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	return <div></div>
}
