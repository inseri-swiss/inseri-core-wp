import { usePublish } from '@inseri/lighthouse'
import { useEffect, useState } from '@wordpress/element'
import { Box, RangeSlider, Slider, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	const { isRange, label, step, initialValue, valueBoundaries, rangeBoundaries, precision, advancedRange } = useGlobalState((state: GlobalState) => state)
	const [minVal, maxVal] = valueBoundaries
	const [minRange, maxRange] = rangeBoundaries

	const [data, setData] = useState<number[]>([])
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

	useEffect(() => {
		if (isRange) {
			updateData(initialValue)
		} else {
			updateData(initialValue[0])
		}
	}, [isRange, ...initialValue])

	return (
		<Box py={'md'}>
			{label.trim() && <Text fz={14}>{label}</Text>}
			{SliderElement}
		</Box>
	)
}
