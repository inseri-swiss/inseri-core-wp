import { usePublish, useRestorableState } from '@inseri/lighthouse'
import { Box, RangeSlider, Slider, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	const { isRange, label, step, initialValue, valueBoundaries, rangeBoundaries, precision, advancedRange } = useGlobalState((state: GlobalState) => state)
	const [minVal, maxVal] = valueBoundaries
	const [minRange, maxRange] = rangeBoundaries

	const [data, setData] = useRestorableState<number[]>('selected', initialValue)
	const [publishValue] = usePublish('selected', isRange ? 'range value' : 'slider value')
	const publish = (input: any) => publishValue(input, 'application/json')

	const updateData = (input: number | number[]) => {
		const preparedData = Array.isArray(input) ? input : [input]
		setData(preparedData)
		publish(input)
	}

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
			onChange={updateData}
		/>
	) : (
		<Slider min={minVal} max={maxVal} step={step} precision={precision} value={data[0]} onChange={updateData} />
	)

	return (
		<Box py="xs">
			{label.trim() && <Text fz={14}>{label}</Text>}
			{SliderElement}
		</Box>
	)
}
