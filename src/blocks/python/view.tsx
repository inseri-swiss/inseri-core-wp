import { useControlTower, useDispatchMany, useWatch, useWatchMany } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { useCallback, useEffect } from '@wordpress/element'
import { Box, CodeEditor, Group, useGlobalState } from '../../components'
import { TopBar } from './TopBar'
import { Action } from './WorkerActions'
import config from './block.json'
import { Attributes } from './index'
import { GlobalState } from './state'

interface ViewProps {
	attributes: Readonly<Attributes>
	isGutenbergEditor?: boolean
	isSelected?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
}

export default function View(props: ViewProps) {
	const { isGutenbergEditor, isSelected, renderResizable } = props
	const { height, editable, mode, inputCode, content, inputs, pyWorker, blockId, blockName, outputs, isVisible, autoTrigger, workerStatus } = useGlobalState(
		(state: GlobalState) => state
	)
	const { updateState, runCode } = useGlobalState((state: GlobalState) => state.actions)
	const isEditable = (editable || isGutenbergEditor) && mode === 'editor'
	const prevWorkerStatus = usePrevious(workerStatus)

	const { value, status } = useWatch(inputCode)
	const watchedValues = useWatchMany(inputs)
	const watchedValuesIndicator = Object.values(watchedValues).reduce((acc, item) => acc + (item ? JSON.stringify(item).length : 0), 0)
	const areWatchedValuesReady = Object.values(watchedValues).reduce((acc, item) => acc && item.status === 'ready', true)
	const joinedOutputKeys = outputs.map((o) => o.description).join('')
	const areOutputsReady = outputs.every((o) => o.contentType !== '')

	useEffect(() => {
		if (!areWatchedValuesReady) {
			updateState({ blockerr: 'Inputs are not ready' })
		} else if (!areOutputsReady) {
			updateState({ blockerr: 'Content type is not set for all outputs' })
		} else {
			updateState({ blockerr: '' })
		}
	}, [areWatchedValuesReady, areOutputsReady])

	useEffect(() => {
		if (areWatchedValuesReady) {
			const watchedInputs = Object.entries(watchedValues).reduce((acc, [variable, watched]) => {
				acc[variable] = watched.value
				return acc
			}, {} as any)

			pyWorker.postMessage({ type: 'SET_INPUTS', payload: watchedInputs })
		}
	}, [watchedValuesIndicator, areWatchedValuesReady])

	useEffect(() => {
		pyWorker.postMessage({ type: 'SET_OUTPUTS', payload: outputs.map((o) => o.description) })
	}, [joinedOutputKeys])

	const producersBeacons = useControlTower({ blockId, blockType: config.name, instanceName: blockName }, outputs)
	const joinedOutputTypes = outputs.map((o) => o.contentType).join('')
	const joinedProducerKeys = producersBeacons.reduce((acc, b) => acc + b.key, '')
	const joinedKeys = outputs.reduce((acc, b) => acc + b.key, '')

	useEffect(() => {
		if (joinedProducerKeys !== joinedKeys) {
			updateState({ outputs: producersBeacons })
		}
	}, [joinedProducerKeys])

	const dispatchRecord = useDispatchMany(producersBeacons)

	useEffect(() => {
		outputs.forEach((o) => {
			dispatchRecord[o.description]({ contentType: o.contentType })
		})
	}, [joinedOutputTypes])

	const pyDispatcher = useCallback(
		(message: MessageEvent<Action>) => {
			if (message?.data?.type === 'SET_RESULTS') {
				Object.entries(message.data.payload).forEach(([key, val]) => {
					let convertedData = val
					if (convertedData instanceof Uint8Array) {
						const found = outputs.find((o) => o.description === key)
						convertedData = new Blob([convertedData.buffer], { type: found!.contentType })
					}

					dispatchRecord[key]({ status: 'ready', value: convertedData })
				})
			}
		},
		[Object.keys(dispatchRecord).join('')]
	)

	useEffect(() => {
		pyWorker.addEventListener('message', pyDispatcher)
		return () => pyWorker.removeEventListener('message', pyDispatcher)
	}, [pyDispatcher])

	let preparedValue = value

	if ((status !== 'ready' && status !== 'initial') || !preparedValue) {
		preparedValue = ''
	}

	const code = mode === 'viewer' ? preparedValue : content

	// must be the last useEffect
	useEffect(() => {
		if (autoTrigger && areWatchedValuesReady && areOutputsReady && workerStatus === 'ready' && prevWorkerStatus !== 'in-progress') {
			runCode(code)
		}
	}, [
		areWatchedValuesReady,
		areOutputsReady,
		watchedValuesIndicator,
		content,
		workerStatus,
	])

	const editorElement = (
		<CodeEditor
			height={height}
			type={'python'}
			value={code}
			onChange={(val) => {
				if (isEditable && mode === 'editor') {
					updateState({ content: val })
				}
			}}
		/>
	)

	return isVisible || isSelected ? (
		<Box p="md">
			<Group position="apart" mb={4} pl="sm" spacing="xs">
				<TopBar code={code} />
			</Group>
			{renderResizable ? renderResizable(editorElement) : editorElement}
		</Box>
	) : isGutenbergEditor ? (
		<Box
			style={{
				height: height + 36 /* button */ + 32 /* padding */ + 4 /* marginBottom of button*/,
				border: '1px dashed currentcolor',
				borderRadius: '2px',
			}}
		>
			<Box />
			<svg width="100%" height="100%">
				<line strokeDasharray="3" x1="0" y1="0" x2="100%" y2="100%" style={{ stroke: 'currentColor' }} />
			</svg>
		</Box>
	) : (
		<div />
	)
}
