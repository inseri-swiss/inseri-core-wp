import { useControlTower, useDispatch } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { IconFiles } from '@tabler/icons'
import { BlockControls, InspectorControls, MediaPlaceholder } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarGroup } from '@wordpress/components'
import { forwardRef, useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Image, Select, Text, useGlobalState } from '../../components'
import config from './block.json'
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
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ thumbnail, label, ...others }: ItemProps, ref) => (
	<div ref={ref} {...others}>
		<Group noWrap>
			<Image src={thumbnail} width={38} height={38} fit="contain" />

			<Text size="sm">{label}</Text>
		</Group>
	</div>
))

export function MediaLibraryView() {
	const { label, selectedFileId, files, output, isLoading, hasError, fileContent, mime } = useGlobalState((state: GlobalState) => state)
	const { loadMedias, chooseFile } = useGlobalState((state: GlobalState) => state.actions)
	const dispatch = useDispatch(output)
	const prevMime = usePrevious(mime)

	useEffect(() => {
		loadMedias()
	}, [])

	useEffect(() => {
		if (isLoading) {
			dispatch({ status: 'loading' })
		}
		if (hasError) {
			dispatch({ status: 'error' })
		}
		if (fileContent) {
			if (prevMime && prevMime !== mime) {
				dispatch({ status: 'unavailable' })
			}

			setTimeout(() => dispatch({ status: 'ready', value: fileContent, contentType: mime }), 100)
		}
	}, [isLoading, hasError, fileContent, mime])

	return (
		<Box p="md">
			<Select
				clearable
				itemComponent={SelectItem}
				label={label}
				value={selectedFileId}
				data={files}
				onChange={(val) => {
					chooseFile(val)
				}}
			/>
		</Box>
	)
}
