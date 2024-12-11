import { usePublish, useRestorableState } from '@inseri/lighthouse'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Loader, Select } from '../../components'
import { useGlobalState } from '../../components/StateProvider'
import { GlobalState } from './state'

interface ViewProps {
	renderHiding?: (BlockComponent: JSX.Element) => JSX.Element
	attributes: Record<string, any>
}

export default function View({ renderHiding, attributes }: ViewProps) {
	const { label, files, isLoading, hasError, fileContent, mime, isVisible } = useGlobalState((state: GlobalState) => state)
	const { chooseFile, loadFile } = useGlobalState((state: GlobalState) => state.actions)
	const [publish, setEmpty] = usePublish('file', 'file')
	const [selectedFile, setSelectedFile] = useRestorableState('selectedFile', attributes.selectedFile, !isVisible)

	useEffect(() => {
		loadFile(selectedFile)
	}, [selectedFile])

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
		<Box>
			<Select
				clearable
				readOnly={files.length === 1}
				label={label}
				value={selectedFile}
				data={files}
				onChange={(val) => {
					setSelectedFile(val)
					chooseFile(val)
				}}
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
