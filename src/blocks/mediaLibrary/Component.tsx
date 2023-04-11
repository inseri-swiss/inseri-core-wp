import { useControlTower, useDispatch } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { IconFiles } from '@tabler/icons-react'
import { BlockControls, InspectorControls, MediaPlaceholder } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarGroup, ToggleControl, ToolbarButton } from '@wordpress/components'
import { useDispatch as useWpDispatch } from '@wordpress/data'
import { forwardRef, useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Image, Loader, Select, Text, useGlobalState } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState } from './state'

const baseBeacon = { contentType: '', description: 'file', key: 'file', default: '' }

export function MediaLibraryEdit(props: BlockEditProps<Attributes>) {
	const { createErrorNotice } = useWpDispatch('core/notices')
	const { isSelected } = props
	const { output, blockId, blockName, label, isWizardMode, actions, fileIds, files, isVisible } = useGlobalState((state: GlobalState) => state)
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
						<TextControl label="Label" value={label} onChange={(value) => updateState({ label: value })} />
					</PanelRow>
					{files.length === 1 && (
						<PanelRow>
							<ToggleControl
								label={__('Show block', 'inseri-core')}
								help={isVisible ? __('Block is visible.', 'inseri-core') : __('Block is invisible.', 'inseri-core')}
								checked={isVisible}
								onChange={(newVisibility) => {
									updateState({ isVisible: newVisibility })
								}}
							/>
						</PanelRow>
					)}
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<MediaPlaceholder
					onSelect={(elements) => {
						const newFileIds = elements.map((e) => e.id)

						updateState({
							fileIds: newFileIds,
							selectedFileId: newFileIds.length === 1 ? String(newFileIds[0]) : null,
							isWizardMode: false,
							isVisible: true,
						})
					}}
					multiple={true}
					labels={{ title: 'Media Libray' }}
					icon={<IconFiles style={{ fill: 'none' }} />}
					onError={(err) => createErrorNotice(err, { type: 'snackbar' })}
				></MediaPlaceholder>
			) : (
				<MediaLibraryView isGutenbergEditor isSelected={isSelected} />
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

interface ViewProps {
	isSelected?: boolean
	isGutenbergEditor?: boolean
}

export function MediaLibraryView({ isGutenbergEditor, isSelected }: ViewProps) {
	const { label, selectedFileId, files, output, isLoading, hasError, fileContent, mime, isVisible } = useGlobalState((state: GlobalState) => state)
	const { loadMedias, chooseFile } = useGlobalState((state: GlobalState) => state.actions)
	const dispatch = useDispatch(output)
	const prevMime = usePrevious(mime)

	useEffect(() => {
		loadMedias()
	}, [])

	useEffect(() => {
		if (prevMime && prevMime !== mime) {
			dispatch({ status: 'unavailable' })
		}
	}, [mime])

	useEffect(() => {
		dispatch({ contentType: mime })
	}, [mime])

	useEffect(() => {
		setTimeout(() => {
			if (isLoading) {
				dispatch({ status: 'loading' })
			}
			if (hasError) {
				dispatch({ status: 'error' })
			}
			if (!isLoading && !hasError && fileContent) {
				dispatch({ status: 'ready', value: fileContent })
			}
			if (!fileContent) {
				dispatch({ status: 'initial', value: fileContent })
			}
		}, 100)
	}, [isLoading, hasError, fileContent])

	return isVisible || isSelected ? (
		<Box p="md">
			<Select
				clearable
				readOnly={files.length === 1}
				itemComponent={SelectItem}
				label={label}
				value={selectedFileId}
				data={files}
				onChange={(val) => chooseFile(val)}
				rightSection={isLoading && <Loader p="xs" />}
				error={hasError ? __('An error has occurred.', 'inseri-core') : null}
			/>
		</Box>
	) : isGutenbergEditor ? (
		<Box
			style={{
				height: '68px',
				border: '1px dashed currentcolor',
				borderRadius: '2px',
			}}
		>
			<Box />
			<svg width="100%" height="100%">
				<line strokeDasharray="3" x1="0" y1="0" x2="100%" y2="100%" style={{ stroke: 'currentColor' }} />
			</svg>
		</Box>
	) : (
		<div />
	)
}
