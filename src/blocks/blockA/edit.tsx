import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'
import './editor.scss'
import { Box, Select } from '../../components'
import { Provider } from '../../blockUtils'
import { useEffect, useState } from '@wordpress/element'

export default function Edit({ setAttributes }: BlockEditProps<any>) {
	const sources = InseriCore.useAvailableSources('all')

	const selectOptions = sources.map((a: any) => ({ label: a.description, value: a }))
	const [color, setColor] = useState('#000')

	useEffect(() => {
		const color = Math.floor(Math.random() * 16777215).toString(16)
		setColor('#' + color)
	}, [])

	return (
		<Provider>
			<Box {...useBlockProps()} style={{ padding: '8px', border: '2px solid ' + color }}>
				<Select label="Input" data={selectOptions} onChange={(picked) => setAttributes({ source: picked })} />
			</Box>
		</Provider>
	)
}
