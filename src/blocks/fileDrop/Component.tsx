import { Dropzone } from '@mantine/dropzone'
import { IconUpload, IconX, IconCheck } from '@tabler/icons'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextareaControl, TextControl, ToggleControl } from '@wordpress/components'
import { __ } from '@wordpress/i18n'
import { ActionIcon, Button, createStyles, Group, MultiSelect, Stack, Text, useGlobalState, useMantineTheme } from '../../components'
import { COMMON_CONTENT_TYPES } from '../../utils'
import { Attributes } from './index'
import { GlobalState } from './state'

const useStyles = createStyles((theme) => ({
	label: {
		textTransform: 'uppercase',
		fontSize: '11px',
		fontWeight: 500,
		lineHeight: '1.4',
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
		marginBottom: 'calc(8px)',
	},
	multiSelectValues: {
		[`& > input[type="search"]`]: {
			backgroundColor: 'unset',
			minHeight: 'unset',
			border: 0,
		},

		[`& > input[type="search"]:focus`]: {
			backgroundColor: 'unset',
			minHeight: 'unset',
			border: 0,
			boxShadow: 'unset',
		},
	},

	itemButton: {
		[`&:hover`]: {
			backgroundColor: 'unset',
		},
	},

	itemGroup: {
		[`&:hover`]: {
			backgroundColor: theme.colors[theme.primaryColor][1],
		},
	},
}))

export function FileDropEdit({ isSelected }: BlockEditProps<Attributes>) {
	const { blockName, actions, accepts, mainText, subText, multiple } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const { multiSelectValues, label } = useStyles().classes

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			showHandle={isSelected}
			enable={{ bottom: true }}
			minHeight={100}
			onResize={(_event, _direction, element) => {
				updateState({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

	return (
		<>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label={__('Block Name', 'inseri-core')} value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Support multiple files', 'inseri-core')}
							checked={multiple}
							onChange={() => {
								updateState({ multiple: !multiple })
							}}
						/>
					</PanelRow>
					<PanelRow>
						<MultiSelect
							classNames={{ values: multiSelectValues, label }}
							data={COMMON_CONTENT_TYPES}
							value={accepts}
							onChange={(vals) => updateState({ accepts: vals })}
							label={__('Which file types are accepted', 'inseri-core')}
							mb="sm"
							clearable
							searchable
						/>
					</PanelRow>
					<PanelRow>
						<TextareaControl label={__('Primary Text', 'inseri-core')} value={mainText} onChange={(value) => updateState({ mainText: value })} />
					</PanelRow>
					<PanelRow>
						<TextareaControl label={__('Secondary Text', 'inseri-core')} value={subText} onChange={(value) => updateState({ subText: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<FileDropView renderResizable={renderResizable} isGutenbergEditor />
		</>
	)
}

interface ViewProps {
	isGutenbergEditor?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export function FileDropView({ renderResizable, isGutenbergEditor }: ViewProps) {
	const { accepts, mainText, subText, multiple, height, files, chosenFile } = useGlobalState((state: GlobalState) => state)
	const { updateState, addFiles, removeFile } = useGlobalState((state: GlobalState) => state.actions)
	const { itemButton, itemGroup } = useStyles().classes

	const theme = useMantineTheme()
	const primaryColor = theme.colors[theme.primaryColor][6]
	const redColor = theme.colors.red[6]

	const Zone = (
		<Dropzone activateOnClick={!isGutenbergEditor} p={0} multiple={multiple} onDrop={(newFiles) => addFiles(newFiles)} accept={accepts}>
			<Group position="center" spacing="xl" style={{ height, pointerEvents: 'none' }}>
				<Dropzone.Accept>
					<IconUpload size={50} stroke={1.5} color={primaryColor} />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<IconX size={50} stroke={1.5} color={redColor} />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<IconUpload size={50} stroke={1.5} />
				</Dropzone.Idle>

				<div>
					<Text size="xl" inline>
						{mainText}
					</Text>
					<Text size="sm" color="dimmed" inline mt={7}>
						{subText}
					</Text>
				</div>
			</Group>
		</Dropzone>
	)

	const selectedItemStyle = {
		border: '1px solid ' + primaryColor,
	}

	return (
		<div>
			{renderResizable ? renderResizable(Zone) : Zone}
			<Stack mt="xs" spacing="xs">
				{Object.entries(files).map(([key, f]) => {
					const styles = chosenFile === key ? selectedItemStyle : {}

					return (
						<Group
							key={key}
							spacing={0}
							className={chosenFile === key ? undefined : itemGroup}
							style={{
								height: '40px',
								borderRadius: '3px',
								padding: '2px 5px',
								...styles,
							}}
						>
							{chosenFile === key ? (
								<Group style={{ flex: 1 }} spacing={0}>
									<IconCheck size={18} />
									<Text style={{ flex: 1 }} fz="sm" ta="center" color="blue">
										{f.name}
									</Text>
								</Group>
							) : (
								<Button
									classNames={{ root: itemButton }}
									ml={18}
									variant="subtle"
									style={{ flex: 1 }}
									onClick={() => {
										updateState({ chosenFile: key })
									}}
								>
									{f.name}
								</Button>
							)}
							<ActionIcon onClick={() => removeFile(key)}>
								<IconX size={18} />
							</ActionIcon>
						</Group>
					)
				})}
			</Stack>
		</div>
	)
}
