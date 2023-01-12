import { useAvailableBeacons, useJsonBeacons, useWatch } from '@inseri/lighthouse'
import { IconPhoto } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, Image, Select, Text, useGlobalState } from '../../components'
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

export function PhotoEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, input, isWizardMode, actions, altText, caption } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = !!input.key

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const jsonBeacons = useJsonBeacons(urlSchema)
	const contentTypeBeacons = useAvailableBeacons('image/')
	const availableBeacons = { ...jsonBeacons, ...contentTypeBeacons }
	const imageOptions = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))

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
						<TextControl label="Caption" value={caption} onChange={(value) => updateState({ caption: value })} />
					</PanelRow>
					<PanelRow>
						<TextControl label="Alt Text" value={altText} onChange={(value) => updateState({ altText: value })} />
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
				<PhotoView />
			)}
		</>
	)
}

export function PhotoView() {
	const { input, isBlob, isPrevBlob, imageUrl, prevImageUrl, caption, altText } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const { value, status, contentType } = useWatch(input)

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

			if (isPrevBlob) {
				URL.revokeObjectURL(prevImageUrl)
			}
		}
	}, [value])

	return <Box>{imageUrl && <Image src={imageUrl} caption={caption} alt={altText} />}</Box>
}
