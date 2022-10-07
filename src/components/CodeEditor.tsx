import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-xml-doc'
import Editor from 'react-simple-code-editor'
import { createStyles } from '../components'

const useStyles = createStyles((theme) => ({
	editor: {
		fontSize: theme.fontSizes.sm,
		counterReset: 'line',
		border: '1px solid #ced4da',

		[`&> textarea`]: {
			outline: 'none',
		},
		[`&> textarea:focus`]: {
			boxShadow: 'none',
		},
	},
	editorLineNumber: {
		position: 'absolute',
		left: '0px',
		color: theme.colors.gray[5],
		textAlign: 'right',
		width: '32px',
		marginLeft: '4px',
	},
}))

interface Props {
	value: string
	onChange: (code: string) => void
	type: 'json' | 'xml'
}

export function CodeEditor({ value, onChange, type }: Props) {
	const { editor, editorLineNumber } = useStyles().classes

	return (
		<Editor
			className={editor}
			value={value}
			onValueChange={onChange}
			highlight={(code) =>
				highlight(code, languages[type], type)
					.split('\n')
					.map((line, i) => `<span class='${editorLineNumber}'>${i + 1}</span>${line}`)
					.join('\n')
			}
			padding={{ top: 16, bottom: 16, right: 16, left: 54 }}
			style={{
				fontFamily: 'monospace',
				minHeight: '128px',
			}}
		/>
	)
}
