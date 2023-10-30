import { Nucleus, usePublish, useWatch } from '@inseri/lighthouse'
import { IconCircleOff } from '@tabler/icons-react'
import { useCallback } from '@wordpress/element'
import { CytoscapeComponent, Group, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

interface ViewProps {
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View({ renderResizable }: ViewProps) {
	const { inputKey, height, layout } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const [publish] = usePublish('select', 'node/edge selection')
	const onSelect = useCallback((event: any, type: string) => publish({ _type: type, ...event }, 'application/json'), [])

	const { isEmpty, altText, value } = useWatch(inputKey, {
		onBlockRemoved: () => updateState({ inputKey: '', isWizardMode: true }),
		onNone: () => ({ isEmpty: true, altText: 'No data is set', value: [] }),
		onSome: (nucleus: Nucleus<string>) => {
			if (!nucleus.contentType.match('/json')) {
				return { isEmpty: true, altText: `This content-type ${nucleus.contentType} is not supported`, value: [] }
			}

			return { isEmpty: false, altText: '', value: nucleus.value }
		},
	})

	const graphElement = isEmpty ? (
		<Group
			align="center"
			position="center"
			style={{
				background: '#F8F9FA',
				color: '#868E96',
				height: height ?? 'auto',
			}}
		>
			<IconCircleOff size={40} />
			<Text size="xl" align="center">
				{altText}
			</Text>
		</Group>
	) : (
		<CytoscapeComponent elements={value} height={height} layoutName={layout} onSelect={onSelect} />
	)

	return renderResizable ? renderResizable(graphElement) : graphElement
}
