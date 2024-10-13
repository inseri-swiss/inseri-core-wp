import { Nucleus, usePublish, useRestorableState, useWatch } from '@inseri/lighthouse'
import { IconCircleOff } from '@tabler/icons-react'
import { useCallback } from '@wordpress/element'
import { useDeepCompareEffect } from 'react-use'
import { CytoscapeComponent, Group, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

interface ViewProps {
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View({ renderResizable }: ViewProps) {
	const { inputKey, height, layout, styleKey, layoutKey } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const [node, setNode] = useRestorableState<any>('select', null)

	const [publish] = usePublish('select', 'node/edge selection')
	const onSelect = useCallback((event: any, type: string) => setNode({ _type: type, ...event }), [])

	useDeepCompareEffect(() => {
		if (node) {
			publish(node, 'application/json')
		}
	}, [node])

	const watchRecord = useWatch(
		{ inputKey, styleKey, layoutKey },
		{
			onBlockRemoved: (keyName) => {
				updateState({ [keyName]: '', isWizardMode: true })
			},
			onNone: (keyName: string) => ({ isEmpty: keyName === 'inputKey', altText: 'No data is set', value: undefined }),
			onSome: (nucleus: Nucleus<string>) => {
				if (!nucleus.contentType.match('/json')) {
					return { isEmpty: true, altText: `This content-type ${nucleus.contentType} is not supported`, value: undefined }
				}

				return { isEmpty: false, altText: '', value: nucleus.value }
			},
		}
	)

	const found = Object.entries(watchRecord).find(([_k, v]) => v.isEmpty) ?? ['', { isEmpty: false, altText: '' }]
	const { isEmpty, altText } = found[1]

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
		<CytoscapeComponent
			elements={watchRecord.inputKey.value}
			stylesheet={watchRecord.styleKey.value}
			layout={watchRecord.layoutKey.value}
			height={height}
			layoutName={layout}
			onSelect={onSelect}
		/>
	)

	return renderResizable ? renderResizable(graphElement) : graphElement
}
