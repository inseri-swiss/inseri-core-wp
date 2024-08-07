import { Nucleus, usePublish, useWatch } from '@inseri/lighthouse'
import { usePrevious } from '@mantine/hooks'
import { useEffect } from '@wordpress/element'
import { Box, CodeEditor, Group, TopBar, useGlobalState } from '../../components'
import { Attributes } from './index'
import { GlobalState } from './state'

interface ViewProps {
	attributes: Readonly<Attributes>
	isGutenbergEditor?: boolean
	renderResizable?: (EditorComponent: JSX.Element) => JSX.Element
	renderHiding?: (BlockComponent: JSX.Element) => JSX.Element
}

const IMG = 'plot'

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
		outputs,
		isVisible,
		autoTrigger,
		workerStatus,
		hasInputError,
		inputRevision,
		outputRevision,
		outputRecord,
		highestNoImgBlobs,
		imgBlobs,
		jsonFiles,
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

	const normalOutputs = outputs.map((i) => ({ key: i[0], description: i[0] }))
	const jsonOutputs = Object.keys(jsonFiles).map((i) => ({ key: i, description: i }))
	const imgOutputs = Array.from(Array(highestNoImgBlobs)).map((_v, idx) => ({ key: IMG + idx, description: `${IMG} ${idx + 1}` }))

	const publishRecord = usePublish([...normalOutputs, ...jsonOutputs, ...imgOutputs])
	const areInputsReady = Object.values(hasInputError).every((b) => !b)
	const areOutputsReady = outputs.every((o) => o[1] !== '')

	useEffect(() => {
		Object.entries(outputRecord).forEach(([key, val]) => {
			const contentType = outputs.find((o) => o[0] === key)![1]
			publishRecord[key][0](val, contentType)
		})

		for (let i = 0; i < highestNoImgBlobs; i++) {
			if (i < imgBlobs.length) {
				const blob = imgBlobs[i]

				if (blob.type === 'image/svg+xml') {
					blob.text().then((svgText) => publishRecord[IMG + i][0](svgText, blob.type))
				} else {
					publishRecord[IMG + i][0](blob, blob.type)
				}
			} else {
				publishRecord[IMG + i][1]()
			}
		}

		Object.entries(jsonFiles).forEach(([key, jsonString]) => {
			try {
				if (jsonString) {
					const obj = JSON.parse(jsonString)
					publishRecord[key][0](obj, 'application/json')
				} else {
					publishRecord[key][1]()
				}
			} catch (error) {
				publishRecord[key][1]()
			}
		})
	}, [outputRevision])

	const watchedCode = useWatch(inputCode, {
		onBlockRemoved: () => updateState({ inputCode: '', isWizardMode: true, wizardStep: 1, mode: '' }),
		onNone: () => '',
		onSome: ({ value, contentType }: Nucleus<any>) => (contentType.includes('python') ? value : ''),
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
			type={'python'}
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
