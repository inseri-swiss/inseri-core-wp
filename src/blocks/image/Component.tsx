import { IconPhoto } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, Text, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

export function PhotoEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, input, isWizardMode, actions, altText, caption } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = !!input.key

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

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
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Caption" value={caption} onChange={(value) => updateState({ caption: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Alt Text" value={altText} onChange={(value) => updateState({ altText: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="lg" spacing={0}>
						<IconPhoto size={28} />
						<Text ml="xs" fz={24}>
							{__('Image', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Display image by selecting a block source', 'inseri-core')}
						data={[]}
						value={''}
						searchable
						onChange={(key) => updateState({ webApiId: parseInt(key!), block: { isWizardMode: false } })}
					/>
				</Box>
			) : (
				<PhotoView />
			)}
		</>
	)
}

export function PhotoView() {
	return <Box p="md">Placeholder</Box>
}
