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
	const { value, status } = InseriCore.useInseriStore(attributes.source)
	const [url, setUrl] = useState('')

	useEffect(() => {
		if (status === 'ready' && value) {
			setUrl(URL.createObjectURL(value))
		}
	}, [value, status])

	return (
		<Provider>
			<Stack {...useBlockProps()} spacing={0}>
				<Transition transition="fade" mounted={isSelected}>
					{(styles) => (
						<Box style={{ ...styles }} p="md">
							Input
							<Select data={selectOptions} value={attributes.source} onChange={(picked) => setAttributes({ source: picked })} />
						</Box>
					)}
				</Transition>

				<Box p="md">{url ? <img src={url} /> : 'Choose one'}</Box>
			</Stack>
		</Provider>
	)
}
