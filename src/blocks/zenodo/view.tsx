import { useDispatch } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Loader, Select, useGlobalState } from '../../components'
import { GlobalState } from './state'

interface ViewProps {
	isSelected?: boolean
	isGutenbergEditor?: boolean
}

export default function View({ isGutenbergEditor, isSelected }: ViewProps) {
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
