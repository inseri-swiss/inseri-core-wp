import { __ } from '@wordpress/i18n'
import { Box, Select } from '../../components'
import { Attributes } from './index'
import { useWatch, usePublish, Nucleus } from '@inseri/lighthouse-next'
import { isValueValid } from './utils'

interface ViewProps {
	attributes: Readonly<Attributes>
	setAttributes?: (modifier: Partial<Attributes>) => void
	setWizardMode?: (flag: boolean) => void
}

export default function View(props: ViewProps) {
	const { attributes, setAttributes, setWizardMode } = props
	const { inputKey, label, searchable, clearable } = attributes
	const [publishValue, publishEmpty] = usePublish('selected', __('chosen value', 'inseri-core'))

	const data = useWatch(inputKey, {
		onNone: () => [] as any[],
		onSome: ({ value }: Nucleus<Array<any>>) => (isValueValid(value) ? value : []),
		onBlockRemoved: () => {
			if (setAttributes && setWizardMode) {
				setAttributes({ inputKey: '' })
				setWizardMode(true)
			}
		},
	})

	return (
		<Box p="md">
			<Select
				label={label}
				data={data}
				onChange={(item) => {
					if (item) {
						publishValue(item, 'application/json')
					} else {
						publishEmpty()
					}
				}}
				searchable={searchable}
				clearable={clearable}
			/>
		</Box>
	)
}
