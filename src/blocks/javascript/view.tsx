import { Nucleus, usePublish, useRestorableState, useWatch } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { useEffect } from '@wordpress/element'
import { Box, Group } from '../../components'
import { CodeEditor } from '../../components/CodeEditor'
import { useGlobalState } from '../../components/StateProvider'
import { TopBar } from '../../components/TopBar'
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
		inputs,
		worker,
		outputs,
		isVisible,
		autoTrigger,
		workerStatus,
		hasInputError,
		inputRevision,
		outputRecord,
		outputRevision,
	} = useGlobalState((state: GlobalState) => state)

	const content = useGlobalState((state: GlobalState) => decodeURIComponent(state.content))
	const [cachedContent, setCachedContent] = useRestorableState('code', content, !editable || !isVisible)

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

	useEffect(() => {
		Object.entries(outputRecord).forEach(([key, val]) => {
			const contentType = outputs.find((o) => o[0] === key)![1]
			let convertedData = val

			if (convertedData instanceof Uint8Array) {
				convertedData = new Blob([convertedData], { type: contentType })
			}

			publishRecord[key][0](convertedData, contentType)
		})
	}, [outputRevision])

	const watchedCode = useWatch(inputCode, {
		onBlockRemoved: () => updateState({ inputCode: '', isWizardMode: true, wizardStep: 1, mode: '' }),
		onNone: () => '',
		onSome: ({ value, contentType }: Nucleus<any>) => (contentType.includes('javascript') ? value : ''),
	})

	const code = mode === 'viewer' ? watchedCode : cachedContent

	// must be the last useEffect
	useEffect(() => {
		if (autoTrigger && areInputsReady && areOutputsReady && workerStatus === 'ready' && prevWorkerStatus !== 'in-progress') {
			runCode(code)
		}
	}, [
		areInputsReady,
		areOutputsReady,
		inputRevision,
		cachedContent,
		workerStatus,
	])

	const editorElement = (
		<CodeEditor
			height={height}
			type={'javascript'}
			value={code}
			onChange={(val) => {
				if (isEditable && mode === 'editor') {
					updateState({ content: encodeURIComponent(val) })
					setCachedContent(val)
				}
			}}
		/>
	)

	const blockElement = (
		<Box>
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
