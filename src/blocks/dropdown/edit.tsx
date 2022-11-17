import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'
import './editor.scss'
import { Stack, Select, Box, Transition } from '../../components'
import { Provider } from '../../blockUtils'
import { useEffect, useState } from '@wordpress/element'

export default function Edit({ attributes, setAttributes, isSelected }: BlockEditProps<any>) {
	const sources = InseriCore.useAvailableSources('all')

	const selectOptions = sources.map((a: any) => ({ label: a.description, value: a }))
	const [dropdownOptions, setDropdownOptions] = useState([])
	const val = InseriCore.useInseriStore(attributes.source)

	useEffect(() => {
		if (val.status === 'ready') {
			setDropdownOptions(val.value)
		}
	}, [val.value, val.status])

	useEffect(() => {
		if (!attributes.color) {
			const color = Math.floor(Math.random() * 16777215).toString(16)
			setAttributes({ color: '#' + color })
		}
	}, [])

	useEffect(() => {
		const h = InseriCore.addBlock('dropdown', [{ description: 'selected', contentType: 'application/json', key: 'selected' }], attributes.handle)
		setAttributes({ handle: h })

		return () => InseriCore.removeBlock(h)
	}, [])

	const dispatch = InseriCore.createDispatch(attributes.handle, 'selected')

	const onDropdownChange = (picked: string | null) => {
		if (picked) {
			dispatch({ value: picked, status: 'ready' })
		}
	}

	return (
		<Provider>
			<Stack {...useBlockProps()} style={{ border: '2px solid ' + attributes.color }} spacing={0}>
				<Transition transition="fade" mounted={isSelected}>
					{(styles) => (
						<Box style={{ ...styles }} p="md">
							Input
							<Select data={selectOptions} value={attributes.source} onChange={(picked) => setAttributes({ source: picked })} />
						</Box>
					)}
				</Transition>

				<Box p="md">
					Choose one
					<Select data={dropdownOptions} onChange={onDropdownChange} />
				</Box>
			</Stack>
		</Provider>
	)
}
