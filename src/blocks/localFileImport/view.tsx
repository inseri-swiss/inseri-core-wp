import { usePublish } from '@inseri/lighthouse'
import { Dropzone } from '@mantine/dropzone'
import { IconCheck, IconDownload, IconX } from '@tabler/icons-react'
import { useEffect } from '@wordpress/element'
import { ActionIcon, Button, Group, Stack, Text, createStyles, useGlobalState, useMantineTheme } from '../../components'
import { guessContentTypeByExtension, handleBody } from '../../utils'
import { GlobalState } from './state'

const useStyles = createStyles((theme) => ({
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

	hoveringWrapper: {
		'&:hover': {
			borderRadius: '1px',
			boxShadow: '0 0 0 var(--wp-admin-border-width-focus) var(--wp-admin-theme-color)',
		},
	},
}))

interface ViewProps {
	isGutenbergEditor?: boolean
	isSelected?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View({ renderResizable, isGutenbergEditor, isSelected }: ViewProps) {
	const { accepts, mainText, subText, multiple, height, files, chosenFile } = useGlobalState((state: GlobalState) => state)
	const { updateState, addFiles, removeFile } = useGlobalState((state: GlobalState) => state.actions)

	const { itemButton, itemGroup, hoveringWrapper } = useStyles().classes
	const [publishValue, publishEmpty] = usePublish('data', 'data provided by visitor')

	const theme = useMantineTheme()
	const primaryColor = theme.colors[theme.primaryColor][6]
	const redColor = theme.colors.red[6]
	const showDropZone = multiple || Object.keys(files).length === 0

	useEffect(() => {
		if (chosenFile) {
			const file = files[chosenFile]
			let contentType: string = file.type

			if (!contentType) {
				const splittedName = file.name.split('.')
				const extension = splittedName[splittedName.length - 1]
				contentType = guessContentTypeByExtension(extension) ?? ''
			}

			handleBody(file, contentType).then((processedData) => {
				publishValue(processedData, contentType)
			})
		}

		if (!chosenFile) {
			publishEmpty()
		}
	}, [chosenFile])

	const Zone = (
		<Dropzone p={0} multiple={multiple} onDrop={(newFiles) => addFiles(newFiles)} accept={accepts}>
			<Group position="center" spacing="xl" style={{ height, pointerEvents: 'none' }}>
				<Dropzone.Accept>
					<IconDownload size={50} stroke={1.5} color={primaryColor} />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<IconX size={50} stroke={1.5} color={redColor} />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<IconDownload size={50} stroke={1.5} />
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
		<div style={{ padding: isGutenbergEditor ? '32px 24px' : undefined }} className={isGutenbergEditor && !isSelected ? hoveringWrapper : undefined}>
			{showDropZone && (renderResizable ? renderResizable(Zone) : Zone)}
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
