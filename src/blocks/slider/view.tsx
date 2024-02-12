import { usePublish } from '@inseri/lighthouse'
import { Box, Slider, useGlobalState, Text, RangeSlider } from '../../components'
import { GlobalState } from './state'

interface ViewProps {
	isGutenbergEditor?: boolean
	isSelected?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View(props: ViewProps) {
	const { isRange, label, step, initialValue, valueBoundaries, rangeBoundaries } = useGlobalState((state: GlobalState) => state)
	const [minVal, maxVal] = valueBoundaries
	const [minRange, maxRange] = rangeBoundaries

	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const [publishValue, publishEmpty] = usePublish('selected', isRange ? 'range value' : 'slider value')

	const SliderElement = isRange ? (
		<RangeSlider min={minVal} max={maxVal} step={step} minRange={minRange} maxRange={maxRange} defaultValue={initialValue as any} />
	) : (
		<Slider min={minVal} max={maxVal} step={step} defaultValue={initialValue[0]} />
	)

	return (
		<Box py={'md'}>
			{label.trim() && <Text fz={14}>{label}</Text>}
			{SliderElement}
		</Box>
	)
}
