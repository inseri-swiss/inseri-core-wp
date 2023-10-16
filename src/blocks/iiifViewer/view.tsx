import { useWatch, Nucleus } from '@inseri/lighthouse'
import { IconCircleOff } from '@tabler/icons-react'
import { __ } from '@wordpress/i18n'
import { Group, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'
//@ts-ignore
import Viewer from '@samvera/clover-iiif/viewer' // eslint-disable-line import/no-unresolved

export default function View() {
	const { inputKey } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const { isEmpty, altText, value } = useWatch(inputKey, {
		onBlockRemoved: () => updateState({ inputKey: '', isWizardMode: true }),
		onNone: () => ({ isEmpty: true, altText: 'No URL is set', value: '' }),
		onSome: (nucleus: Nucleus<string>) => {
			if (typeof nucleus.value !== 'string' || !/^https?:\/\//.test(nucleus.value)) {
				return { isEmpty: true, altText: __('It is an invalid URL.', 'inseri-core'), value: '' }
			}

			return { isEmpty: false, altText: '', value: nucleus.value }
		},
	})

	return isEmpty ? (
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
		<Viewer iiifContent={value} />
	)
}
