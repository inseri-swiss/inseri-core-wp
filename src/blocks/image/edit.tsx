import { InseriRoot, useDiscover } from '@inseri/lighthouse'
import { IconPhoto } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, SelectControl, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect, useRef, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, Group, SetupEditorEnv, SourceSelect, StateProvider, Text, useGlobalState } from '../../components'
import json from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

const urlSchema = {
	$ref: '#/definitions/URL',
	definitions: {
		URL: { type: 'string', format: 'uri', pattern: '^https?://' },
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

function EditComponent(props: BlockEditProps<Attributes>) {
	const { isSelected } = props
	const { blockName, inputKey, isWizardMode, actions, altText, caption, height, fit } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions

	const isValueSet = !!inputKey
	const imageRef = useRef<HTMLImageElement>(null)

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	const [activeTab, setActiveTab] = useState<string | null>('All-Images')
	const sources = useDiscover({
		jsonSchemas: activeTab === 'All-Images' || activeTab === 'Image-URL' ? [urlSchema] : undefined,
		contentTypeFilter: activeTab === 'All-Images' || activeTab === 'Image-Resource' ? 'image/' : undefined,
	})

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
			<BlockControls controls={[]}>
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
							{__('Image Box', 'inseri-core')}
						</Text>
					</Group>
					<SourceSelect
						label={__('Display image by selecting a block source', 'inseri-core')}
						data={sources}
						selectValue={inputKey}
						tabs={['All Images', 'Image URL', 'Image Resource', 'All']}
						activeTab={activeTab}
						onSelectChange={(key) => updateState({ inputKey: key ?? '', isWizardMode: !key })}
						setActiveTab={setActiveTab}
						withAsterisk
					/>
				</Box>
			) : (
				<View renderResizable={renderResizable} imageRef={imageRef} isSelected={isSelected} />
			)}
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'image'} addSuffixToInputs={['inputKey']}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={json.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
