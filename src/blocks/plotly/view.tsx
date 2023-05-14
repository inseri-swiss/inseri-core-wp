import { BaseBeaconState, ConsumerBeacon, RecordUpdater, useControlTower, useDispatchMany, useWatch } from '@inseri/lighthouse'
import { useEffect, useState } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import stringify from 'json-stable-stringify'
import cloneDeep from 'lodash.clonedeep'
import Plot from 'react-plotly.js'
import { Box, Text, useGlobalState } from '../../components'
import { isBeaconReady } from '../../utils'
import blockConfig from './block.json'
import { GlobalState } from './state'

const simpleEventTransform = (event: Plotly.PlotHoverEvent | Plotly.PlotHoverEvent | Plotly.PlotSelectionEvent) => {
	return event.points.map(({ curveNumber, data, x, y, pointIndex }) => ({ curveNumber, data, x, y, pointIndex }))
}

const propagateIfSet = (eventType: string, outputs: ConsumerBeacon[], recordUpdater: RecordUpdater) => (val: any) => {
	const isSet = outputs.some((o) => o.description === eventType)
	if (isSet && recordUpdater[eventType]) {
		let processedVal = val

		if (eventType === 'onClick' || eventType === 'onHover') {
			processedVal = simpleEventTransform(val)
		}

		recordUpdater[eventType]({ status: 'ready', value: processedVal })
	}
}

const useDefaultIfNotReady = (beacon: BaseBeaconState, defaultVal: any) => {
	if (['ready', 'initial'].every((s) => s !== beacon.status) || !beacon.value) {
		return defaultVal
	}

	return beacon.value
}

interface ViewProps {
	renderResizable?: (Component: JSX.Element) => JSX.Element
	isSelected?: boolean
}

export default function View({ renderResizable }: ViewProps) {
	const { height, inputFull, inputData, inputLayout, inputConfig, blockId, blockName, outputs, revision } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)

	const [data, setData] = useState<any>([])
	const [layout, setLayout] = useState<any>({})
	const [config, setConfig] = useState<any>({})

	const producersBeacons = useControlTower({ blockId, blockType: blockConfig.name, instanceName: blockName }, outputs)
	const joinedProducerKeys = producersBeacons.reduce((acc, b) => acc + b.key, '')
	const joinedOutputsKeys = outputs.reduce((acc, b) => acc + b.key, '')

	useEffect(() => {
		if (joinedProducerKeys !== joinedOutputsKeys) {
			updateState({ outputs: producersBeacons })
		}
	}, [joinedProducerKeys])

	const dispatchRecord = useDispatchMany(producersBeacons)

	const watchFull = useWatch(inputFull)
	const watchData = useWatch(inputData)
	const watchLayout = useWatch(inputLayout)
	const watchConfig = useWatch(inputConfig)

	const hasInputsError = !(
		isBeaconReady(inputFull, watchFull) &&
		isBeaconReady(inputData, watchData) &&
		isBeaconReady(inputLayout, watchLayout) &&
		isBeaconReady(inputConfig, watchConfig)
	)

	const processedFull = useDefaultIfNotReady(watchFull, { data: [], layout: {} })
	const processedData = useDefaultIfNotReady(watchData, [])
	const processedLayout = useDefaultIfNotReady(watchLayout, {})
	const processedConfig = useDefaultIfNotReady(watchConfig, {})

	const strFull = stringify(processedFull)
	const strData = stringify(processedData)
	const strLayout = stringify(processedLayout)
	const strConfig = stringify(processedConfig)

	const setLayoutWithExtra = (newLayout: any) => {
		const { width, height: _, ...rest } = newLayout
		setLayout(cloneDeep({ ...rest, autosize: true }))
	}

	useEffect(() => {
		setData(cloneDeep(processedData))
	}, [strData])

	useEffect(() => {
		setLayoutWithExtra(processedLayout)
	}, [strLayout])

	useEffect(() => {
		setConfig(cloneDeep({ ...processedConfig, responsive: true }))
	}, [strConfig])

	useEffect(() => {
		if (processedFull.data && processedData.length === 0) {
			setData(cloneDeep(processedFull.data))
		}
		if (processedFull.layout && Object.keys(processedLayout).length === 0) {
			setLayoutWithExtra(processedFull.layout)
		}
	}, [strFull, strData, strLayout])

	const chart = (
		<Plot
			revision={revision}
			data={data}
			layout={layout}
			config={config}
			useResizeHandler={true}
			style={{ width: '100%', height: '100%' }}
			// events
			onClick={propagateIfSet('onClick', outputs, dispatchRecord)}
			onHover={propagateIfSet('onHover', outputs, dispatchRecord)}
		/>
	)

	return (
		<Box style={{ height: height ?? 'auto' }}>
			{hasInputsError && (
				<Text fz={14} color="red">
					{__('Not all inputs are ready!', 'inseri-core')}
				</Text>
			)}
			{renderResizable ? renderResizable(chart) : chart}
		</Box>
	)
}
