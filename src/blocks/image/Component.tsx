import { useAvailableBeacons, useJsonBeacons, useWatch } from '@inseri/lighthouse'
import { IconPhoto, IconPhotoOff, IconCircleOff } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, SelectControl, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useRef } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Select, Text, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

const defaultInput = {
	key: '',
	contentType: '',
	description: '',
}

const urlSchema = {
	$ref: '#/definitions/URL',
	definitions: {
		URL: { format: 'uri', pattern: '^https?://' },
	},
}

const resizingOptions = [
	{ label: __('Stay contained', 'inseri-core'), value: 'contain' },
	{ label: __('Cover', 'inseri-core'), value: 'cover' },
	{ label: __('Stretch', 'inseri-core'), value: 'fill' },
	{ label: __('Scale down', 'inseri-core'), value: 'scale-down' },
	{ label: __('Original size', 'inseri-core'), value: 'none' },
]
const resizingHelps = {
	contain: __('Resize image to stay contained within its container', 'inseri-core'),
	cover: __('Resize image to cover its container', 'inseri-core'),
	fill: __('Stretch image to fit its container', 'inseri-core'),
	'scale-down': __('Display image at its original size but scale it down to fit its container if necessary', 'inseri-core'),
	none: __('Display image always at its original size', 'inseri-core'),
}

export function PhotoEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, input, isWizardMode, actions, altText, caption, height, fit } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = !!input.key
	const imageRef = useRef<HTMLImageElement>(null)

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const jsonBeacons = useJsonBeacons(urlSchema)
	const contentTypeBeacons = useAvailableBeacons('image/')
	const availableBeacons = { ...jsonBeacons, ...contentTypeBeacons }
	const imageOptions = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))

	const resizerHeight = height ?? imageRef.current?.height ?? 'auto'

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			size={{ height: resizerHeight, width: 'auto' }}
			enable={{ bottom: true }}
			showHandle={isSelected}
			onResize={(_event, _direction, element) => {
				updateState({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

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
						<TextControl label={__('Block Name', 'inseri-core')} value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label={__('Caption', 'inseri-core')} value={caption} onChange={(value) => updateState({ caption: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label={__('Alt Text', 'inseri-core')} value={altText} onChange={(value) => updateState({ altText: value })} />
					</PanelRow>
					<PanelRow>
						<div style={{ width: '100%' }}>
							<TextControl
								label={__('height', 'inseri-core')}
								type="number"
								min={0}
								value={height ?? '0'}
								onChange={(value) => {
									const newVal = parseInt(value)
									updateState({ height: newVal > 0 ? newVal : null })
								}}
								help={__('Set 0 for automatic height adjustment', 'inseri-core')}
							/>
						</div>
					</PanelRow>
					<PanelRow>
						<div style={{ width: '100%' }}>
							<SelectControl
								label={__('Resizing behavior', 'inseri-core')}
								value={fit}
								onChange={(value) => updateState({ fit: value as any })}
								options={resizingOptions}
								help={resizingHelps[fit]}
							/>
						</div>
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="lg" spacing={0}>
						<IconPhoto size={28} />
						<Text ml="xs" fz={24}>
							{__('Image', 'inseri-core')}
						</Text>
					</Group>
					<Select
						label={__('Display image by selecting a block source', 'inseri-core')}
						data={imageOptions}
						value={input.key}
						searchable
						onChange={(key) => updateState({ input: key ? availableBeacons[key] : defaultInput, isWizardMode: false })}
					/>
				</Box>
			) : (
				<PhotoView renderResizable={renderResizable} imageRef={imageRef} isSelected={isSelected} />
			)}
		</>
	)
}

interface ViewProps {
	renderResizable?: (Component: JSX.Element) => JSX.Element
	imageRef?: React.Ref<HTMLImageElement>
	isSelected?: boolean
}

export function PhotoView({ renderResizable, imageRef, isSelected }: ViewProps) {
	const { input, isBlob, isPrevBlob, imageUrl, prevImageUrl, caption, altText, height, fit, hasError } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const { value, status, contentType } = useWatch(input)

	const isUrlEmpty = !imageUrl

	const update = (url: string, blob: boolean) =>
		updateState({
			imageUrl: url,
			prevImageUrl: imageUrl,
			isBlob: blob,
			isPrevBlob: isBlob,
		})

	useEffect(() => {
		let processedValue = value

		if (status === 'ready') {
			if (typeof processedValue === 'string' && contentType.includes('image/svg+xml')) {
				processedValue = new Blob([value], { type: 'image/svg+xml' })
			}

			if (typeof processedValue === 'string') {
				update(processedValue, false)
			}

			if (typeof processedValue === 'object' && processedValue instanceof Blob) {
				update(URL.createObjectURL(processedValue), true)
			}

			if (!processedValue) {
				update('', false)
			}

			if (isPrevBlob) {
				URL.revokeObjectURL(prevImageUrl)
			}

			updateState({ hasError: false })
		}
	}, [value])

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
					height: height ?? 'auto',
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
