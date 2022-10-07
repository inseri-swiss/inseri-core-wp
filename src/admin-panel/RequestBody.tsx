import { useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { createStyles, Group, SegmentedControl, Text, Textarea } from '../components'
import { Params, ParamsTable } from './ParamsTable'
import { IconCircleOff } from '@tabler/icons'

const useStyles = createStyles({
	input: {
		'&:focus': {
			border: '1px solid #8c8f94',
			boxShadow: 'none',
		},
		resize: 'vertical',
	},
})

interface Props {
	onChange: (body: string | Params) => void
}

export function RequestBody({ onChange }: Props) {
	const { input } = useStyles().classes

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
				<Textarea classNames={{ input }} autosize maxRows={10} mt="sm" />
			)}
		</>
	)
}
