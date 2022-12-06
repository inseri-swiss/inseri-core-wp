import { useControlTower, useDispatch } from '@inseri/lighthouse'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, TextControl, ResizableBox } from '@wordpress/components'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, CodeEditor, Select } from '../../components'
import config from './block.json'
import { Attributes } from './index'
import { useDebouncedValue } from '@mantine/hooks'
import { getBodyTypeByContenType, TEXTUAL_CONTENT_TYPES } from '../../utils'

const textEditorBeacon = { contentType: 'text/plain', description: __('content', 'inseri-core'), key: 'content', default: '' }

export function TextEditorEdit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes } = props
	const { blockId, blockName } = attributes

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, [textEditorBeacon])

	useEffect(() => {
		if (producersBeacons.length > 0) {
			setAttributes({ output: producersBeacons[0] })
		}
	}, [producersBeacons.length])

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			enable={{ bottom: true }}
			minHeight={150}
			onResize={(_event, _direction, element) => {
				setAttributes({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

	return (
		<>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl label="Block Name" value={blockName} onChange={(value) => setAttributes({ blockName: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<TextEditorView {...props} setAttributes={setAttributes} renderResizable={renderResizable} />
		</>
	)
}

interface ViewProps {
	attributes: Readonly<Attributes>
	setAttributes?: (attrs: Partial<Attributes>) => void
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export function TextEditorView(props: ViewProps) {
	const { attributes, setAttributes, renderResizable } = props
	const dispatch = useDispatch(attributes.output)

	const [contentType, setContentType] = useState('')
	const [codeType, setCodeType] = useState('')

	const [code, setCode] = useState('')
	const [debouncedCode] = useDebouncedValue(code, 500)

	useEffect(() => {
		const initContentType = attributes.output?.contentType ?? textEditorBeacon.contentType
		setContentType(initContentType)
		setCodeType(getBodyTypeByContenType(initContentType) ?? 'text')
	}, [])

	useEffect(() => {
		dispatch({ value: debouncedCode, status: 'ready' })
	}, [debouncedCode])

	useEffect(() => {
		dispatch({ contentType })
		setCodeType(getBodyTypeByContenType(contentType) ?? 'text')

		if (setAttributes) {
			const newOutput = { ...textEditorBeacon, contentType }
			setAttributes({ output: newOutput })
		}
	}, [contentType])

	const editorElement = <CodeEditor height={attributes.height} type={codeType} value={code} onChange={(val) => setCode(val)} />

	return (
		<Box p="md">
			<Select mb="md" data={TEXTUAL_CONTENT_TYPES} value={contentType} onChange={(v) => setContentType(v!)} />
			{renderResizable ? renderResizable(editorElement) : editorElement}
		</Box>
	)
}
