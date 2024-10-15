import { usePublish, useRestorableState } from '@inseri/lighthouse'
import { useEffect } from '@wordpress/element'
import { useUpdateEffect } from 'react-use'
import { Box, RangeSlider, Slider, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	const { isRange, label, step, initialValue, valueBoundaries, rangeBoundaries, precision, advancedRange } = useGlobalState((state: GlobalState) => state)
	const [minVal, maxVal] = valueBoundaries
	const [minRange, maxRange] = rangeBoundaries

	const [data, setData] = useRestorableState<number[]>('selected', initialValue)
	const [publishValue] = usePublish('selected', isRange ? 'range value' : 'slider value')
	const publish = (input: any) => publishValue(input, 'application/json')

	useEffect(() => {
		publish(isRange ? data : data[0])
	}, [isRange, ...data])

	useUpdateEffect(() => {
		setData(initialValue)
	}, [isRange, ...initialValue])

	const preparedMinRange = advancedRange ? minRange : 0
	const preparedMaxRange = advancedRange ? maxRange : undefined

	const SliderElement = isRange ? (
		<RangeSlider
			min={minVal}
			max={maxVal}
			step={step}
			precision={precision}
			minRange={preparedMinRange}
			maxRange={preparedMaxRange}
			value={data as any}
			onChange={(val) => setData(val)}
		/>
	) : (
		<Slider min={minVal} max={maxVal} step={step} precision={precision} value={data[0]} onChange={(val) => setData([val])} />
	)

	return (
		<Box py="xs">
			{label.trim() && <Text fz={14}>{label}</Text>}
			{SliderElement}
		</Box>
	)
}
