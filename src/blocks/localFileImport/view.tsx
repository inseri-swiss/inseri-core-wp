import { usePublish } from '@inseri/lighthouse'
import { Dropzone } from '@mantine/dropzone'
import { IconCheck, IconDownload, IconX } from '@tabler/icons-react'
import { useEffect, useRef } from '@wordpress/element'
import { ActionIcon, Button, Group, Stack, Text, createStyles, useMantineTheme } from '@mantine/core'
import { useGlobalState } from '../../components/StateProvider'
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
}))

interface ViewProps {
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View({ renderResizable }: ViewProps) {
	const { accepts, mainText, subText, multiple, height, files, chosenFile } = useGlobalState((state: GlobalState) => state)
	const { updateState, addFiles, removeFile } = useGlobalState((state: GlobalState) => state.actions)

	const { itemButton, itemGroup } = useStyles().classes
	const [publishValue, publishEmpty] = usePublish('data', 'data provided by visitor')

	const theme = useMantineTheme()
	const primaryColor = theme.colors[theme.primaryColor][6]
	const redColor = theme.colors.red[6]
	const showDropZone = multiple || Object.keys(files).length === 0
	const openRef = useRef<() => void>(null)

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
		<Dropzone
			p={0}
			multiple={multiple}
			onDrop={(newFiles) => addFiles(newFiles)}
			accept={accepts}
			activateOnClick={false}
			openRef={openRef}
			styles={{ inner: { pointerEvents: 'all' } }}
		>
			<Stack align="center" justify="center" spacing={0} style={{ height }}>
				<Dropzone.Accept>
					<IconDownload size={50} stroke={1.5} color={primaryColor} />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<IconX size={50} stroke={1.5} color={redColor} />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<IconDownload size={50} stroke={1.5} />
				</Dropzone.Idle>

				<Text size="sm" inline mt="sm">
					{subText}
				</Text>
				<Button mt="md" onClick={() => openRef.current?.()} style={{ pointerEvents: 'all' }}>
					{mainText}
				</Button>
			</Stack>
		</Dropzone>
	)

	const selectedItemStyle = {
		border: '1px solid ' + primaryColor,
	}

	return (
		<div>
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
