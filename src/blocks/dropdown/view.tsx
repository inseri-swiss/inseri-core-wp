import { Nucleus, usePublish, useRestorableState, useWatch } from '@inseri/lighthouse'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Select } from '../../components'
import { Attributes } from './index'
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
	const [key, setKey] = useRestorableState<string | null>('selection', null)

	useEffect(() => {
		if (key) {
			publishValue(key, 'application/json')
		} else {
			publishEmpty()
		}
	}, [key])

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
		<Box>
			<Select label={label} data={data} value={key} onChange={(item) => setKey(item)} searchable={searchable} clearable={clearable} />
		</Box>
	)
}
