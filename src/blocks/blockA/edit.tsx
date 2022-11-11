import { __ } from '@wordpress/i18n'
import { useBlockProps } from '@wordpress/block-editor'
import { BlockEditProps } from '@wordpress/blocks'
import './editor.scss'
import { Select } from '../../components'

export default function Edit({ attributes, setAttributes, isSelected }: BlockEditProps<any>) {
	const sources = InseriCore.useAvailableSources('all')

	const selectOptions = sources.map((a: any) => ({ label: a.description, value: a }))
	const picked = attributes.source

	return (
		<div {...useBlockProps()} style={{ padding: '8px' }}>
			Howdy User,
			<br />
			You picked: {picked?.description ?? 'Nothing'}
			{isSelected && <Select data={selectOptions} onChange={(picked) => setAttributes({ source: picked })} />}
		</div>
	)
}
