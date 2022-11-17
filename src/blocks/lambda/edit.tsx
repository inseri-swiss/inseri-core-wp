import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'
import './editor.scss'
import { Stack, CodeEditor, Select, Box, Button, Transition } from '../../components'
import { Provider } from '../../blockUtils'
import { useEffect, useState } from '@wordpress/element'

export default function Edit({ attributes, setAttributes, isSelected }: BlockEditProps<any>) {
	const sources = InseriCore.useAvailableSources('all')

	const selectOptions = sources.map((a: any) => ({ label: a.description, value: a }))
	const [result, setResult] = useState('')
	const [code, setCode] = useState(
		attributes.code ||
			`(input1, input2) => {
  //TODO
  return input
}`
	)

	const val1 = InseriCore.useInseriStore(attributes.source)
	const val2 = InseriCore.useInseriStore(attributes.source2)

	useEffect(() => {
		if (!attributes.color) {
			const color = Math.floor(Math.random() * 16777215).toString(16)
			setAttributes({ color: '#' + color })
		}
	}, [])

	useEffect(() => {
		const h = InseriCore.addBlock('js-lambda', [{ description: 'result', contentType: 'application/json', key: 'result' }], attributes.handle)
		setAttributes({ handle: h })

		return () => InseriCore.removeBlock(h)
	}, [])

	const dispatch = InseriCore.createDispatch(attributes.handle, 'result')

	const run = () => {
		const fun = eval(code)
		if (val1.value && val1.status === 'ready' && val2.value && val2.status === 'ready') {
			const res = fun(val1.value, val2.value)
			dispatch({ value: res, status: 'ready' })
			setResult(JSON.stringify(res))
		} else if (val1.value && val1.status === 'ready') {
			const res = fun(val1.value)
			dispatch({ value: res, status: 'ready' })
			setResult(JSON.stringify(res))
		} else if (!attributes.source && !attributes.source2) {
			const res = fun(val1.value)
			dispatch({ value: res, status: 'ready' })
		}
	}

	return (
		<Provider>
			<Stack {...useBlockProps()} style={{ border: '2px solid ' + attributes.color }} spacing={0}>
				<Transition transition="fade" mounted={isSelected}>
					{(styles) => (
						<>
							<Box style={{ ...styles }} px="md" pt="md">
								1. Input
								<Select data={selectOptions} value={attributes.source} onChange={(picked) => setAttributes({ source: picked })} />
							</Box>
							<Box style={{ ...styles }} px="md" pt="md">
								2. Input
								<Select data={selectOptions} value={attributes.source2} onChange={(picked) => setAttributes({ source2: picked })} />
							</Box>
						</>
					)}
				</Transition>

				<Box p="md">
					Transform
					<CodeEditor
						type="javascript"
						value={code}
						onChange={(code) => {
							setAttributes({ code })
							setCode(code)
						}}
					/>
				</Box>
				<Transition transition="fade" mounted={isSelected}>
					{(styles) => (
						<Stack style={styles} px="md">
							<Button onClick={run}>Run</Button>
						</Stack>
					)}
				</Transition>

				<Transition transition="fade" mounted={isSelected}>
					{(styles) => (
						<Box style={{ ...styles }} p="md">
							Output
							<CodeEditor type="json" value={result} />
						</Box>
					)}
				</Transition>
			</Stack>
		</Provider>
	)
}
