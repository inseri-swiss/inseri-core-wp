import { usePublish } from '@inseri/lighthouse'
import { useEffect } from '@wordpress/element'
import { Box, RangeSlider, Slider, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

export default function View() {
	const { isRange, label, step, initialValue, valueBoundaries, rangeBoundaries, precision } = useGlobalState((state: GlobalState) => state)
	const [minVal, maxVal] = valueBoundaries
	const [minRange, maxRange] = rangeBoundaries

	const [publishValue] = usePublish('selected', isRange ? 'range value' : 'slider value')
	const publish = (data: any) => publishValue(data, 'application/json')

	const SliderElement = isRange ? (
		<RangeSlider
			min={minVal}
			max={maxVal}
			step={step}
			precision={precision}
			minRange={minRange}
			maxRange={maxRange}
			defaultValue={initialValue as any}
			onChange={publish}
		/>
	) : (
		<Slider min={minVal} max={maxVal} step={step} precision={precision} defaultValue={initialValue[0]} onChange={publish} />
	)

	useEffect(() => {
		if (isRange) {
			publish(initialValue)
		} else {
			publish(initialValue[0])
		}
	}, [isRange])

	return (
		<Box py={'md'}>
			{label.trim() && <Text fz={14}>{label}</Text>}
			{SliderElement}
		</Box>
	)
}
