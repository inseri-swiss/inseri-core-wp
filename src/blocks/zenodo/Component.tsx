import { useControlTower, useDispatch } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { IconBooks } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToggleControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Button, Checkbox, Group, Loader, Select, Stack, Text, TextInput, useGlobalState } from '../../components'
import { getFormattedBytes } from '../../utils'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState } from './state'

const baseBeacon = { contentType: '', description: 'file', key: 'file', default: '' }

export function ZenodoEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { output, blockId, blockName, label, isWizardMode, files, isVisible, doi, doiError, isWizardLoading, record, hasWizardError } = useGlobalState(
		(state: GlobalState) => state
	)
	const { updateState, setDoi, loadDoi } = useGlobalState((state: GlobalState) => state.actions)

	const isValueSet = files.length > 0
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

	useEffect(() => {
		loadDoi()
	}, [])

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
				<Stack p="md" style={{ border: '1px solid #000' }}>
					<Group mb="sm" spacing={0}>
						<IconBooks size={28} />
						<Text ml="xs" fz={24}>
							{__('Zenodo', 'inseri-core')}
						</Text>
					</Group>
					<TextInput
						label="DOI"
						value={doi}
						onChange={(event) => setDoi(event.currentTarget.value)}
						error={doiError}
						rightSection={isWizardLoading && <Loader size="xs" />}
						withAsterisk
					/>

					{hasWizardError && (
						<>
							<Group position="center" mt="md">
								<Text fz={16} color="red">
									{__('Record not found', 'inseri-core')}
								</Text>
							</Group>
						</>
					)}

					{record && (
						<>
							<Text fz={16} mt="md">
								{record.metadata.title}
							</Text>
							{record.metadata.version && <Text fz={16}>Version: {record.metadata.version}</Text>}

							<Stack style={{ maxHeight: 400, overflow: 'auto', paddingRight: 16, paddingBottom: 10 }}>
								{record.files.map((f) => (
									<Group position="apart" key={f.filename}>
										<Checkbox
											label={f.filename}
											checked={!!files.find((i) => i.label === f.filename)}
											onChange={(event) => {
												let newFiles = []

												if (event.currentTarget.checked) {
													newFiles = [...files, { label: f.filename, value: f.links.download }]
												} else {
													newFiles = files.filter((i) => i.label !== f.filename)
												}

												updateState({ files: newFiles, selectedFile: newFiles.length === 1 ? newFiles[0].value : null })
											}}
										/>
										<Text fz={12}>{getFormattedBytes(f.filesize)}</Text>
									</Group>
								))}
							</Stack>

							<Group position="right">
								<Button variant="filled" onClick={() => updateState({ isWizardMode: false })} disabled={!isValueSet}>
									{__('Use selected files', 'inseri-core')}
								</Button>
							</Group>
						</>
					)}
				</Stack>
			) : (
				<ZenodoView isGutenbergEditor isSelected={isSelected} />
			)}
		</>
	)
}
interface ViewProps {
	isSelected?: boolean
	isGutenbergEditor?: boolean
}

export function ZenodoView({ isGutenbergEditor, isSelected }: ViewProps) {
	const { label, selectedFile, files, output, isLoading, hasError, fileContent, mime, isVisible } = useGlobalState((state: GlobalState) => state)
	const { chooseFile, loadFile } = useGlobalState((state: GlobalState) => state.actions)
	const dispatch = useDispatch(output)
	const prevMime = usePrevious(mime)

	useEffect(() => {
		if (prevMime && prevMime !== mime) {
			dispatch({ status: 'unavailable' })
		}
	}, [mime])

	useEffect(() => {
		dispatch({ contentType: mime })
	}, [mime])

	useEffect(() => {
		loadFile()
	}, [])

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
				label={label}
				value={selectedFile}
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
