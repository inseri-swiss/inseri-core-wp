import { usePublish } from '@inseri/lighthouse'
import { Box, Slider, useGlobalState, Text, RangeSlider } from '../../components'
import { GlobalState } from './state'

interface ViewProps {
	isGutenbergEditor?: boolean
	isSelected?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View(props: ViewProps) {
	const { isRange, label, min, max, step, initialValue } = useGlobalState((state: GlobalState) => state)
	const { updateState } = useGlobalState((state: GlobalState) => state.actions)
	const [publishValue, publishEmpty] = usePublish('selected', isRange ? 'range value' : 'slider value')

	const SliderElement = isRange ? (
		<RangeSlider min={min} max={max} step={step} defaultValue={initialValue as any} />
	) : (
		<Slider min={min} max={max} step={step} defaultValue={initialValue[0]} />
	)

	return (
		<Box py={'md'}>
			{label.trim() && <Text fz={14}>{label}</Text>}
			{SliderElement}
		</Box>
	)
}
