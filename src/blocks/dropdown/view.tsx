import { __ } from '@wordpress/i18n'
import { Box, Select } from '../../components'
import { Attributes } from './index'
import { useWatch, usePublish } from '@inseri/lighthouse-next'
import { isValueValid } from './utils'

interface ViewProps {
	attributes: Readonly<Attributes>
	setAttributes?: (modifier: Partial<Attributes>) => void
	setWizardMode?: (flag: boolean) => void
}

export default function View(props: ViewProps) {
	const { attributes, setAttributes, setWizardMode } = props
	const { inputKey, label, searchable, clearable, blockId } = attributes
	const [publishValue, publishEmpty] = usePublish(blockId, 'selected', __('chosen value', 'inseri-core'))

	const wrapper = useWatch(inputKey, () => {
		if (setAttributes && setWizardMode) {
			setAttributes({ inputKey: '' })
			setWizardMode(true)
		}
	})

	let data = []

	if (wrapper.type === 'wrapper' && isValueValid(wrapper.value)) {
		data = wrapper.value
	}

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
