import { PluginSidebar } from '@wordpress/edit-post'
import { IconBuildingLighthouse } from '@tabler/icons-react'
import { PanelBody } from '@wordpress/components'
export function DataFlow() {
	return (
		<PluginSidebar name="inseri-core-data-flow" title="inseri Data Flow" isPinnable={true} icon={<IconBuildingLighthouse style={{ fill: 'none' }} />}>
			<PanelBody title="Blocks" initialOpen={true}>
				hello world
			</PanelBody>
			<PanelBody title="Graph" initialOpen={true}>
				hello world
			</PanelBody>
		</PluginSidebar>
	)
}
