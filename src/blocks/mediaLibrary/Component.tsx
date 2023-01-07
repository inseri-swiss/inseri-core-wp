import { useControlTower } from '@inseri/lighthouse'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState } from './state'

const baseBeacon = { contentType: '', description: 'file', key: 'file', default: '' }

export function MediaLibraryEdit(_props: BlockEditProps<Attributes>) {
	const { output, blockId, blockName, isWizardMode, actions } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, [baseBeacon])

	useEffect(() => {
		if (producersBeacons.length > 0 && !output.key) {
			updateState({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	const toolbarControls = [
		{
			icon: edit,
			isActive: isWizardMode,
			onClick: () => updateState({ isWizardMode: !isWizardMode }),
			title: __('Edit', 'inseri-core'),
		},
	]

	return (
		<>
			<BlockControls>{<ToolbarGroup controls={toolbarControls} />}</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? <Box p="md" style={{ border: '1px solid #000' }}></Box> : <MediaLibraryView />}
		</>
	)
}

export function MediaLibraryView() {
	return <Box p="md">Placeholder</Box>
}
