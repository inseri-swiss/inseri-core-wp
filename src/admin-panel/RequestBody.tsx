import { IconCircleOff } from '@tabler/icons'
import { useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Group, SegmentedControl, Text } from '../components'
import { CodeEditor } from '../components/CodeEditor'
import { Params, ParamsTable } from './ParamsTable'

interface Props {
	onChange: (body: string | Params) => void
}

export function RequestBody({ onChange }: Props) {
	const NONE = __('None', 'inseri_core')
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

	const isFormType = (type: string) => ['form-urlencoded', 'form-data'].some((i) => i === type)

	return (
		<>
			<SegmentedControl value={bodyType} onChange={setBodyType} data={BODY_TYPES} />
			{bodyType === NONE ? (
				<Group m="lg">
					<IconCircleOff size={24} color="gray" />
					<Text size="md" color="gray">
						{__('no body', 'inseri_core')}
					</Text>
				</Group>
			) : isFormType(bodyType) ? (
				<ParamsTable onChange={onChange} />
			) : (
				<CodeEditor type={bodyType.toLowerCase() as any} value={bodyContent} onChange={setBodyContent} />
			)}
		</>
	)
}
