import { Nucleus, usePublish, useWatch } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { useCallback, useEffect } from '@wordpress/element'
import { Action, Box, CodeEditor, Group, TopBar, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

interface ViewProps {
	attributes: Readonly<Attributes>
	isGutenbergEditor?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
	renderHiding?: (BlockComponent: JSX.Element) => JSX.Element
}

export default function View(props: ViewProps) {
	const { isGutenbergEditor, renderResizable, renderHiding } = props
	const {
		inputerr,
		height,
		editable,
		mode,
		inputCode,
		inputRecord,
		content,
		inputs,
		worker,
		outputs,
		isVisible,
		autoTrigger,
		workerStatus,
		hasInputError,
		inputRevision,
	} = useGlobalState((state: GlobalState) => state)
	const { setInputValue, setInputEmpty, updateState, runCode } = useGlobalState((state: GlobalState) => state.actions)
	const isEditable = (editable || isGutenbergEditor) && mode === 'editor'
	const prevWorkerStatus = usePrevious(workerStatus)

	useWatch(inputs, {
		onBlockRemoved: (varName) => setInputEmpty(varName, true),
		onNone: (varName: string) => setInputEmpty(varName, false),
		onSome: (nucleus: Nucleus<any>, varName: string) => setInputValue(varName, nucleus.value),
		deps: [inputRevision, hasInputError, inputRecord, inputerr],
	})

	const areInputsReady = Object.values(hasInputError).every((b) => !b)
	const publishRecord = usePublish(outputs.map((i) => ({ key: i[0], description: i[0] })))
	const areOutputsReady = outputs.every((o) => o[1] !== '')

	useEffect(() => {
		if (areInputsReady) {
			worker.postMessage({ type: 'SET_INPUTS', payload: inputRecord })
		}
	}, [inputRevision])

	const outputKeys = outputs.map((o) => o[0])

	useEffect(() => {
		worker.postMessage({ type: 'SET_OUTPUTS', payload: outputKeys })
	}, [outputKeys.join()])

	const pyDispatcher = useCallback(
		(message: MessageEvent<Action>) => {
			if (message?.data?.type === 'SET_RESULTS') {
				Object.entries(message.data.payload).forEach(([key, val]) => {
					const contentType = outputs.find((o) => o[0] === key)![1]
					let convertedData = val

					if (convertedData instanceof Uint8Array) {
						convertedData = new Blob([convertedData.buffer], { type: contentType })
					}

					publishRecord[key][0](convertedData, contentType)
				})
			}
		},
		[outputKeys.join('')]
	)

	useEffect(() => {
		worker.addEventListener('message', pyDispatcher)
		return () => worker.removeEventListener('message', pyDispatcher)
	}, [pyDispatcher])

	const watchedCode = useWatch(inputCode, {
		onBlockRemoved: () => updateState({ inputCode: '', isWizardMode: true, wizardStep: 1, mode: '' }),
		onNone: () => '',
		onSome: ({ value, contentType }: Nucleus<any>) => (contentType.includes('javascript') ? value : ''),
	})

	const code = mode === 'viewer' ? watchedCode : content

	// must be the last useEffect
	useEffect(() => {
		if (autoTrigger && areInputsReady && areOutputsReady && workerStatus === 'ready' && prevWorkerStatus !== 'in-progress') {
			runCode(code)
		}
	}, [
		areInputsReady,
		areOutputsReady,
		inputRevision,
		content,
		workerStatus,
	])

	const editorElement = (
		<CodeEditor
			height={height}
			type={'javascript'}
			value={code}
			onChange={(val) => {
				if (isEditable && mode === 'editor') {
					updateState({ content: val })
				}
			}}
		/>
	)

	const blockElement = (
		<Box p="md">
			<Group position="apart" mb={4} pl="sm" spacing="xs">
				<TopBar code={code} />
			</Group>
			{renderResizable ? renderResizable(editorElement) : editorElement}
		</Box>
	)

	if (renderHiding) {
		return renderHiding(blockElement)
	}

	return isVisible ? blockElement : <div />
}
