import { Nucleus, useWatch } from '@inseri/lighthouse'
import { IconCircleOff } from '@tabler/icons-react'
import { __ } from '@wordpress/i18n'
import { Group, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'
//@ts-ignore
import Viewer from '@samvera/clover-iiif/viewer' // eslint-disable-line import/no-unresolved
import { useState } from '@wordpress/element'
import { useAsync } from 'react-use'

export default function View() {
	const { inputKey, showTitle, showInformationPanel, showBadge, dynamicHeight, height } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const [loadsManifest, setLoadsManifest] = useState(true)

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

	useAsync(async () => {
		try {
			const response = await fetch(value)
			setLoadsManifest(response.ok)
		} catch {
			setLoadsManifest(false)
		}
	}, [value])

	const preparedAltText = !loadsManifest ? __('Failed to load IIIF manifest', 'inseri-core') : altText

	return isEmpty || !loadsManifest ? (
		<Group
			align="center"
			position="center"
			style={{
				background: '#F8F9FA',
				color: '#868E96',
				padding: '8px',
				height,
			}}
		>
			<IconCircleOff size={40} />
			<Text size="xl" align="center">
				{preparedAltText}
			</Text>
		</Group>
	) : (
		<div style={{ position: 'relative', height: dynamicHeight ? '60vh' : undefined }}>
			<Viewer
				iiifContent={value}
				options={{
					showTitle,
					showIIIFBadge: showBadge,
					canvasHeight: dynamicHeight ? '100%' : height + 'px',
					informationPanel: {
						open: showInformationPanel,
						renderToggle: showInformationPanel,
					},
					openSeadragon: {
						gestureSettingsMouse: {
							scrollToZoom: false,
						},
					},
				}}
			/>
		</div>
	)
}
