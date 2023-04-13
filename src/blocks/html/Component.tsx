import { useAvailableBeacons, useWatch } from '@inseri/lighthouse'
import { IconHtml, IconCircleOff } from '@tabler/icons-react'
import { BlockControls, InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ToolbarButton, ToolbarGroup } from '@wordpress/components'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { edit } from '@wordpress/icons'
import { Box, CodeEditor, createStyles, Group, Select, Text, useGlobalState } from '../../components'
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
						<ToolbarButton
							icon={edit}
							title={__('Edit', 'inseri-core')}
							isActive={isWizardMode}
							onClick={() => {
								updateState({ isWizardMode: !isWizardMode })
							}}
						/>
						{!isWizardMode && (
							<>
								<ToolbarButton isActive={mode === 'code'} onClick={() => updateState({ mode: 'code' })}>
									{__('HTML', 'inseri-core')}
								</ToolbarButton>
								<ToolbarButton isActive={mode === 'preview'} onClick={() => updateState({ mode: 'preview' })}>
									{__('Preview', 'inseri-core')}
								</ToolbarButton>
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
						<IconHtml size={28} />
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
				<HtmlView isGutenbergEditor isSelected={isSelected} />
			)}
		</>
	)
}

const useViewStyles = createStyles({
	wrapper: {
		'&:hover': {
			borderRadius: '1px',
			boxShadow: '0 0 0 var(--wp-admin-border-width-focus) var(--wp-admin-theme-color)',
		},
	},
})

interface ViewProps {
	isGutenbergEditor?: boolean
	isSelected?: boolean
}

export function HtmlView({ isGutenbergEditor, isSelected }: ViewProps) {
	const { input, mode } = useGlobalState((state: GlobalState) => state)
	const { value, status } = useWatch(input)
	const { wrapper } = useViewStyles().classes

	const isEmpty = !value || (typeof value === 'string' && !value.trim())
	let altText = __('No HTML code is set', 'inser-core')

	let preparedValue = value
	const hasError = status === 'error' || status === 'unavailable'

	if (hasError) {
		preparedValue = ''
		altText = __('An error has occurred', 'inser-core')
	}

	return mode === 'code' ? (
		<Box p="md">
			<CodeEditor type={'html'} value={preparedValue} />
		</Box>
	) : isEmpty || hasError ? (
		<Group
			align="center"
			position="center"
			style={{
				background: '#F8F9FA',
				color: '#868E96',
				padding: '8px',
			}}
		>
			<IconCircleOff size={40} />
			<Text size="xl" align="center">
				{altText}
			</Text>
		</Group>
	) : (
		<div
			className={isGutenbergEditor && !isSelected ? wrapper : undefined}
			style={{ minHeight: isGutenbergEditor ? '50px' : undefined }}
			dangerouslySetInnerHTML={{ __html: preparedValue }}
		/>
	)
}
