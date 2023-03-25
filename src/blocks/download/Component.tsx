import { useAvailableBeacons, useWatch } from '@inseri/lighthouse'
import { IconFileDownload } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Button, Group, Select, Text, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

const defaultInput = {
	key: '',
	contentType: '',
	description: '',
}

export function DownloadEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, input, isWizardMode, actions, label } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = !!input.key

	const { status } = useWatch(input)
	useEffect(() => {
		if (status === 'unavailable') {
			updateState({ input: { ...input, key: '' }, isWizardMode: true })
		}
	}, [status])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const availableBeacons = useAvailableBeacons('')
	const options = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))

	return (
		<>
			<BlockControls>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton
							icon={edit}
							isActive={isWizardMode}
							onClick={() => {
								updateState({ isWizardMode: !isWizardMode })
							}}
							title={__('Edit', 'inseri-core')}
						/>
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label={__('Block Name', 'inseri-core')} value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label={__('Label', 'inseri-core')} value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="lg" spacing={0}>
						<IconFileDownload size={28} />
						<Text ml="xs" fz={24}>
							{__('Download', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Let visitor download a block data', 'inseri-core')}
						data={options}
						value={input.key}
						searchable
						onChange={(key) => updateState({ input: key ? availableBeacons[key] : defaultInput, isWizardMode: false })}
					/>
				</Box>
			) : (
				<DownloadView />
			)}
		</>
	)
}

export function DownloadView() {
	const { label } = useGlobalState((state: GlobalState) => state)
	//const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	return <Button>{label}</Button>
}
