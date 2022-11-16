import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'
import './editor.scss'
import { Stack, CodeEditor, Select, Box, Button } from '../../components'
import { Provider } from '../../blockUtils'
import { useEffect, useState } from '@wordpress/element'

export default function Edit({ attributes, setAttributes }: BlockEditProps<any>) {
	const sources = InseriCore.useAvailableSources('all')

	const selectOptions = sources.map((a: any) => ({ label: a.description, value: a }))
	const [color, setColor] = useState('#000')
	const [result, setResult] = useState('')
	const [code, setCode] = useState(
		attributes.code ||
			`(input) => {
  //TODO
  return input
}`
	)

	const val = InseriCore.useInseriStore(attributes.source)

	useEffect(() => {
		const color = Math.floor(Math.random() * 16777215).toString(16)
		setColor('#' + color)
	}, [])

	useEffect(() => {
		const h = InseriCore.addBlock('js-lambda', [{ description: 'result', contentType: 'application/json', key: 'result' }])
		setAttributes({ handle: h })

		return () => InseriCore.removeBlock(h)
	}, [])

	const dispatch = InseriCore.createDispatch(attributes.handle, 'result')

	const run = () => {
		const fun = eval(code)
		if (val?.value) {
			const res = fun(val.value)
			dispatch({ value: res, status: 'ready' })
			setResult(JSON.stringify(res))
		}
	}

	return (
		<Provider>
			<Stack {...useBlockProps()} style={{ padding: '8px', border: '2px solid ' + color }}>
				<Box>
					Input
					<Select data={selectOptions} onChange={(picked) => setAttributes({ source: picked })} />
				</Box>

				<Box>
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
				<Button onClick={run}>Run</Button>

				<Box>
					Output
					<CodeEditor type="json" value={result} />
				</Box>
			</Stack>
		</Provider>
	)
}
