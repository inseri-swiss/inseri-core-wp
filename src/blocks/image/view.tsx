import { Nucleus, useWatch } from '@inseri/lighthouse'
import { IconCircleOff, IconPhotoOff } from '@tabler/icons-react'
import { __ } from '@wordpress/i18n'
import { Box, Group, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

interface ViewProps {
	renderResizable?: (Component: JSX.Element) => JSX.Element
	imageRef?: React.Ref<HTMLImageElement>
	isSelected?: boolean
}

export default function View({ renderResizable, imageRef, isSelected }: ViewProps) {
	const { inputKey, isBlob, isPrevBlob, imageUrl, prevImageUrl, caption, altText, height, fit, hasError } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const update = (url: string, blob: boolean) =>
		updateState({
			imageUrl: url,
			prevImageUrl: imageUrl,
			isBlob: blob,
			isPrevBlob: isBlob,
			hasError: false,
		})

	useWatch(inputKey, {
		onNone: () => {
			update('', false)
		},
		onSome: ({ contentType, value }: Nucleus<any>) => {
			let processedValue = value

			if (typeof processedValue === 'string' && contentType.includes('image/svg+xml')) {
				processedValue = new Blob([value], { type: 'image/svg+xml' })
			}

			if (typeof processedValue === 'string') {
				update(processedValue, false)
			}

			if (typeof processedValue === 'object' && processedValue instanceof Blob) {
				update(URL.createObjectURL(processedValue), true)
			}

			if (isPrevBlob) {
				URL.revokeObjectURL(prevImageUrl)
			}
		},
		onBlockRemoved: () => {
			updateState({ isWizardMode: true, inputKey: '' })
		},
		deps: [prevImageUrl],
	})

	const isUrlEmpty = !imageUrl
	const highlightBg = isSelected
		? {
				backgroundColor: '#fff',
				backgroundImage: `repeating-linear-gradient(45deg, #808080 25%, transparent 25%, transparent 75%, #808080 75%, #808080),
					 repeating-linear-gradient(45deg, #808080 25%, #ffffff 25%, #ffffff 75%, #808080 75%, #808080)`,
				backgroundPosition: '0 0, 10px 10px',
				backgroundSize: '20px 20px',
			}
		: {}

	let errorText = __('Failed to load', 'inser-core')
	if (altText) {
		errorText += ': ' + altText
	}

	const emptyElement = (
		<Group
			align="center"
			position="center"
			style={{
				background: '#F8F9FA',
				color: '#868E96',
				height: height ?? 'auto',
			}}
		>
			<IconCircleOff size={40} />
			<Text size="xl" align="center">
				{__('No image is set', 'inser-core')}
			</Text>
		</Group>
	)

	const imageElement = isUrlEmpty ? (
		emptyElement
	) : (
		<>
			<img
				ref={imageRef}
				onError={() => updateState({ hasError: true })}
				src={imageUrl}
				alt={altText}
				style={{
					width: '100%',
					height: height ?? '100%',
					objectFit: fit,
				}}
			/>
			{hasError && (
				<Group
					align="center"
					position="center"
					style={{
						inset: '0px',
						position: 'absolute',
						background: '#F8F9FA',
						color: '#868E96',
					}}
				>
					<IconPhotoOff size={40} />
					<Text size="xl" align="center">
						{errorText}
					</Text>
				</Group>
			)}
		</>
	)

	return (
		<Box>
			<figure>
				<div
					style={{
						height: height ?? 'auto',
						position: 'relative',
						textAlign: 'center',
						...highlightBg,
					}}
				>
					{renderResizable ? renderResizable(imageElement) : imageElement}
				</div>

				{!!caption && (
					<Text component="figcaption" size="sm" align="center" color="dimmed">
						{caption}
					</Text>
				)}
			</figure>
		</Box>
	)
}
