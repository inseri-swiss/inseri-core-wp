import { useControlTower } from '@inseri/lighthouse'
import { IconFiles } from '@tabler/icons'
import { BlockControls, InspectorControls, MediaPlaceholder } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarGroup } from '@wordpress/components'
import { forwardRef, useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Image, Select, Text, useGlobalState } from '../../components'
import config from './block.json'

import { useSelect } from '@wordpress/data'
import { Attributes } from './index'
import { GlobalState } from './state'

const baseBeacon = { contentType: '', description: 'file', key: 'file', default: '' }

export function MediaLibraryEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { output, blockId, blockName, label, isWizardMode, actions, fileIds } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = fileIds.length > 0
	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, [baseBeacon])

	useEffect(() => {
		if (producersBeacons.length > 0 && !output.key) {
			updateState({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

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
			<BlockControls>{isValueSet && <ToolbarGroup controls={toolbarControls} />}</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Label" value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<MediaPlaceholder
					onSelect={(elements) => {
						updateState({
							fileIds: elements.map((e) => e.id),
							isWizardMode: false,
						})
					}}
					multiple={true}
					labels={{ title: 'Media Libray' }}
					icon={<IconFiles style={{ fill: 'none' }} />}
				></MediaPlaceholder>
			) : (
				<MediaLibraryView />
			)}
		</>
	)
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
	thumbnail: string
	label: string
	description: string
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ thumbnail, label, description, ...others }: ItemProps, ref) => (
	<div ref={ref} {...others}>
		<Group noWrap>
			<Image src={thumbnail} width={38} height={38} fit="contain" />

			<div>
				<Text size="sm">{label}</Text>
				<Text size="xs" opacity={0.65}>
					{description}
				</Text>
			</div>
		</Group>
	</div>
))

interface WpFile {
	id: number
	source_url: string
	mime_type: string
	title: { raw: string }
	description: { raw: string }
	media_details: {
		sizes: {
			full?: { source_url: string }
			medium?: { source_url: string }
			thumbnail?: { source_url: string }
		}
	}
}

const transformToOption = (file: WpFile) => {
	const sizes = file.media_details.sizes
	let thumbnail = '/wp-includes/images/media/default.png'

	if (sizes.thumbnail?.source_url) {
		thumbnail = sizes.thumbnail.source_url
	} else if (sizes.medium?.source_url) {
		thumbnail = sizes.medium.source_url
	} else if (sizes.full?.source_url) {
		thumbnail = sizes.full.source_url
	} else if (file.mime_type.startsWith('image')) {
		thumbnail = file.source_url
	}

	return { value: String(file.id), label: file.title.raw, description: file.description.raw, url: file.source_url, mime: file.mime_type, thumbnail }
}

export function MediaLibraryView() {
	const { label, selectedFileId, fileIds } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const rawData = useSelect((select: any) => select('core').getMediaItems({ include: fileIds }), []) ?? []
	const data = rawData.map(transformToOption)

	return (
		<Box p="md">
			<Select
				itemComponent={SelectItem}
				label={label}
				value={selectedFileId}
				data={data}
				onChange={(val) => {
					updateState({ selectedFileId: val })
				}}
			/>
		</Box>
	)
}
