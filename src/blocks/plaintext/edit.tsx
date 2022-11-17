import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'
import './editor.scss'
import { Stack, CodeEditor, Select, Box, Transition } from '../../components'
import { Provider } from '../../blockUtils'
import { useEffect, useState } from '@wordpress/element'

export default function Edit({ attributes, setAttributes, isSelected }: BlockEditProps<any>) {
	const sources = InseriCore.useAvailableSources('all')

	const selectOptions = sources.map((a: any) => ({ label: a.description, value: a }))
	const [content, setContent] = useState('')
	const val = InseriCore.useInseriStore(attributes.source)

	useEffect(() => {
		if (val.status === 'ready') {
			if (typeof val.value === 'object') {
				setContent(JSON.stringify(val.value))
			}
			if (typeof val.value === 'string') {
				setContent(val.value)
			}
		}
	}, [val.status, val.value])

	useEffect(() => {
		if (!attributes.color) {
			const color = Math.floor(Math.random() * 16777215).toString(16)
			setAttributes({ color: '#' + color })
		}
	}, [])

	return (
		<Provider>
			<Stack {...useBlockProps()} style={{ border: '2px solid ' + attributes.color }} spacing={0}>
				<Transition transition="fade" mounted={isSelected}>
					{(styles) => (
						<Box style={{ ...styles }} px="md" pt="md">
							Input
							<Select data={selectOptions} value={attributes.source} onChange={(picked) => setAttributes({ source: picked })} />
						</Box>
					)}
				</Transition>

				<Box p="md">
					Plaintext
					<CodeEditor type="text" value={content} />
				</Box>
			</Stack>
		</Provider>
	)
}
