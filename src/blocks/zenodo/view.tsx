import { usePublish } from '@inseri/lighthouse'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Loader, Select, useGlobalState } from '../../components'
import { GlobalState } from './state'

interface ViewProps {
	renderHiding?: (BlockComponent: JSX.Element) => JSX.Element
}

export default function View({ renderHiding }: ViewProps) {
	const { label, selectedFile, files, isLoading, hasError, fileContent, mime, isVisible } = useGlobalState((state: GlobalState) => state)
	const { chooseFile, loadFile } = useGlobalState((state: GlobalState) => state.actions)
	const [publish, setEmpty] = usePublish('file', 'file')

	useEffect(() => {
		loadFile()
	}, [])

	useEffect(() => {
		setTimeout(() => {
			if (isLoading || hasError || !fileContent) {
				setEmpty()
			}
			if (!isLoading && !hasError && fileContent) {
				publish(fileContent, mime)
			}
		}, 100)
	}, [isLoading, hasError, fileContent, mime])

	const blockElement = (
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
	)

	if (renderHiding) {
		return renderHiding(blockElement)
	}

	return isVisible ? blockElement : <div />
}
