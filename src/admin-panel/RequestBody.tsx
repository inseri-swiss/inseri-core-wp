import { IconCircleOff } from '@tabler/icons'
import { useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Button, Group, SegmentedControl, Text } from '../components'
import { CodeEditor } from '../components/CodeEditor'
import { Params, ParamsTable } from './ParamsTable'
import xmlFormatter from 'xml-formatter'

const xmlFormatterOption = {
	collapseContent: true,
	lineSeparator: '\n',
}
interface Props {
	onChange: (body: string | Params) => void
}

export function RequestBody({ onChange }: Props) {
	const NONE = __('None', 'inseri-core')
	const BODY_TYPES = [
		NONE,
		'Text',
		'XML',
		'JSON',
		'form-urlencoded',
		'form-data',
	]

	const [bodyType, setBodyType] = useState<string>(BODY_TYPES[1])
	const [bodyContent, setBodyContent] = useState('')
	const [bodyError, setBodyError] = useState('')

	const isFormType = (type: string) => ['form-urlencoded', 'form-data'].some((i) => i === type)

	const getCodeType = (selectedBodyType: string) => {
		switch (selectedBodyType) {
			case 'XML':
				return 'xml'
			case 'JSON':
				return 'json'
			default:
				return 'text'
		}
	}

	const beautify = () => {
		if (bodyType === 'JSON') {
			try {
				const value = JSON.stringify(JSON.parse(bodyContent), null, 2)
				setBodyContent(value)
			} catch (exception) {
				setBodyError(__('invalid JSON', 'inseri-core'))
			}
		}
		if (bodyType === 'XML') {
			try {
				setBodyContent(xmlFormatter(bodyContent, xmlFormatterOption))
			} catch (exception) {
				setBodyError(__('invalid XML', 'inseri-core'))
			}
		}
	}

	return (
		<>
			<Group position="apart">
				<SegmentedControl value={bodyType} onChange={setBodyType} data={BODY_TYPES} />
				<Button variant="subtle" onClick={beautify}>
					{__('Beautify', 'inseri-core')}
				</Button>
			</Group>
			{bodyType === NONE ? (
				<Group m="lg">
					<IconCircleOff size={24} color="gray" />
					<Text size="md" color="gray">
						{__('no body', 'inseri-core')}
					</Text>
				</Group>
			) : isFormType(bodyType) ? (
				<ParamsTable onChange={onChange} />
			) : (
				<Box mt="sm">
					{bodyError && (
						<Text mt="xs" color="red" size="sm">
							{bodyError}
						</Text>
					)}
					<CodeEditor
						type={getCodeType(bodyType)}
						value={bodyContent}
						onChange={(val) => {
							setBodyError('')
							setBodyContent(val)
						}}
					/>
				</Box>
			)}
		</>
	)
}
