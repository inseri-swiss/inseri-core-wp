import { usePublish } from '@inseri/lighthouse'
import { forwardRef, useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Group, Image, Loader, Select, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

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

export default function View({ isGutenbergEditor, isSelected }: ViewProps) {
	const { label, selectedFileId, files, isLoading, hasError, fileContent, mime, isVisible } = useGlobalState((state: GlobalState) => state)
	const { loadMedias, chooseFile } = useGlobalState((state: GlobalState) => state.actions)
	const [publishValue, publishEmpty] = usePublish('file', 'file')

	useEffect(() => {
		loadMedias()
	}, [])

	useEffect(() => {
		if (hasError) {
			publishEmpty()
		}
		if (!isLoading && !hasError && fileContent) {
			publishValue(fileContent, mime)
		}
		if (!fileContent) {
			publishEmpty()
		}
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
