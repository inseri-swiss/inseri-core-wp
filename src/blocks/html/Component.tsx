import { useAvailableBeacons, useWatch } from '@inseri/lighthouse'
import { IconBrandHtml5 } from '@tabler/icons'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, CodeEditor, Group, Select, Text, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

export function HtmlEdit(props: BlockEditProps<Attributes>) {
	const { isSelected } = props

	const { input, blockId, blockName, isWizardMode, mode, actions } = useGlobalState((state: GlobalState) => state)
	const isValueSet = !!input.key
	const inputBeaconKey = input.key

	const { updateState, chooseInputBeacon } = actions

	const availableBeacons = useAvailableBeacons('html')
	const selectData = Object.keys(availableBeacons)
		.filter((k) => !k.startsWith(blockId + '/'))
		.map((k) => ({ label: availableBeacons[k].description, value: k }))

	const { status } = useWatch(input)
	useEffect(() => {
		if (status === 'unavailable') {
			updateState({ input: { ...input, key: '' }, isWizardMode: true })
		}
	}, [status])

	useEffect(() => {
		if (isValueSet && !isSelected && isWizardMode) {
			updateState({ isWizardMode: false })
		}
	}, [isSelected])

	return (
		<>
			<BlockControls>
				{isValueSet && (
					<ToolbarGroup>
						<ToolbarButton icon={edit} title={__('Edit', 'inseri-core')} isActive={isWizardMode} onClick={() => updateState({ isWizardMode: !isWizardMode })} />
						{!isWizardMode && (
							<>
								<ToolbarButton isActive={mode === 'code'} onClick={() => updateState({ mode: 'code' })}>
									{__('HTML', 'inseri-core')}
								</ToolbarButton>
								<ToolbarButton isActive={mode === 'preview'} onClick={() => updateState({ mode: 'preview' })}>
									{__('preview', 'inseri-core')}
								</ToolbarButton>{' '}
							</>
						)}
					</ToolbarGroup>
				)}
			</BlockControls>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => updateState({ blockName: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			{isWizardMode ? (
				<Box p="md" style={{ border: '1px solid #000' }}>
					<Group mb="md" spacing={0}>
						<IconBrandHtml5 size={28} />
						<Text ml="xs" fz={24}>
							{__('HTML Code', 'inseri-core')}
						</Text>
					</Group>

					<Select
						label={__('Render HTML by selecting a block source', 'inseri-core')}
						data={selectData}
						value={inputBeaconKey}
						onChange={(key) => chooseInputBeacon(availableBeacons[key!])}
					/>
				</Box>
			) : (
				<HtmlView />
			)}
		</>
	)
}

interface ViewProps {
	isGutenbergEditor?: boolean
}

export function HtmlView({}: ViewProps) {
	const { input, mode } = useGlobalState((state: GlobalState) => state)
	const { value, status } = useWatch(input)

	let preparedValue = value

	if ((status !== 'ready' && status !== 'initial') || !preparedValue) {
		preparedValue = ''
	}

	return mode === 'code' ? (
		<Box p="md">
			<CodeEditor type={'html'} value={preparedValue} />
		</Box>
	) : (
		<div dangerouslySetInnerHTML={{ __html: preparedValue }} />
	)
}
