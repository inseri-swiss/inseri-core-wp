import { Actions, Nucleus, usePublish, useWatch } from '@inseri/lighthouse-next'
import { useState } from '@wordpress/element'
import cloneDeep from 'lodash.clonedeep'
import Plot from 'react-plotly.js'
import { Box, useGlobalState } from '../../components'
import { GlobalState } from './state'

const simpleEventTransform = (event: Plotly.PlotHoverEvent | Plotly.PlotHoverEvent | Plotly.PlotSelectionEvent) => {
	return event.points.map(({ curveNumber, data, x, y, pointIndex }) => ({ curveNumber, data, x, y, pointIndex }))
}

const propagateIfSet = (eventType: string, outputs: [string, string][], recordUpdater: Record<string, Actions<any>>) => (val: any) => {
	const isSet = outputs.some((o) => o[0] === eventType)
	if (isSet) {
		let processedVal = val

		if (eventType === 'onClick' || eventType === 'onHover') {
			processedVal = simpleEventTransform(val)
		}

		recordUpdater[eventType][0](processedVal, 'application/json')
	}
}

const prepareLayout = (newLayout: any) => {
	const { width, height, ...rest } = newLayout
	return cloneDeep({ ...rest, autosize: true })
}
const prepareConfig = (newConfig: any) => {
	return cloneDeep({ ...newConfig, responsive: true })
}
interface ViewProps {
	renderResizable?: (Component: JSX.Element) => JSX.Element
	isSelected?: boolean
}

export default function View({ renderResizable }: ViewProps) {
	const { height, inputFull, inputData, inputLayout, inputConfig, outputs, revision } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const [full, setFull] = useState({ data: [], layout: {} })
	const [data, setData] = useState<any[]>([])
	const [layout, setLayout] = useState<any>({})
	const [config, setConfig] = useState<any>({ responsive: true })

	const publishRecord = usePublish(outputs.map((i) => ({ key: i[0], description: i[1] })))

	useWatch(
		{ inputFull, inputData, inputLayout, inputConfig },
		{
			onBlockRemoved: (keyName) => {
				updateState({ [keyName]: '', isWizardMode: true })
			},
			onNone: (keyName: string) => {
				switch (keyName) {
					case 'inputFull':
						setFull({ data: [], layout: {} })
						break
					case 'inputData':
						setData([])
						break
					case 'inputLayout':
						setLayout({})
						break
					case 'inputConfig':
						setConfig({})
						break
				}
			},
			onSome: ({ value }: Nucleus<any>, keyName: string) => {
				switch (keyName) {
					case 'inputFull':
						setFull({ data: value?.data, layout: prepareLayout(value?.layout ?? {}) })
						break
					case 'inputData':
						setData(cloneDeep(value ?? []))
						break
					case 'inputLayout':
						setLayout(prepareLayout(value ?? {}))
						break
					case 'inputConfig':
						setConfig(prepareConfig(value ?? {}))
						break
				}
			},
		}
	)

	const preparedData = data.length === 0 ? full.data : data
	const preparedLayout = Object.keys(layout).length === 0 ? full.layout : layout

	const chart = (
		<Plot
			revision={revision}
			data={preparedData}
			layout={preparedLayout}
			config={config}
			useResizeHandler={true}
			style={{ width: '100%', height: '100%' }}
			// events
			onClick={propagateIfSet('onClick', outputs, publishRecord)}
			onHover={propagateIfSet('onHover', outputs, publishRecord)}
		/>
	)

	return <Box style={{ height: height ?? 'auto' }}>{renderResizable ? renderResizable(chart) : chart}</Box>
}
