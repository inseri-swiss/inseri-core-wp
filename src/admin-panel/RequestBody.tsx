import { useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { createStyles, SegmentedControl, Text, Textarea } from '../components'
import { Params, ParamsTable } from './ParamsTable'

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
		'x-www-form-urlencoded',
		'form-data',
	]
	const [bodyType, setBodyType] = useState<string>(BODY_TYPES[1])

	const isFormType = (type: string) => ['x-www-form-urlencoded', 'form-data'].some((i) => i === type)

	return (
		<>
			<SegmentedControl value={bodyType} onChange={setBodyType} data={BODY_TYPES} />
			{bodyType === NONE ? (
				<Text size="md" color="dimmed" my="lg">
					{__('Empty body', 'inseri_core')}
				</Text>
			) : isFormType(bodyType) ? (
				<ParamsTable onChange={onChange} />
			) : (
				<Textarea classNames={{ input }} autosize maxRows={10} mt="sm" />
			)}
		</>
	)
}
