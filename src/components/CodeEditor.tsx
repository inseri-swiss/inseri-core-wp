import { highlight, languages } from 'prismjs'
import Editor from 'react-simple-code-editor'
import { createStyles } from '../components'

// before a language can be highlighted, it must be imported as follows
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-xml-doc'
import { escapeHtml } from '../utils'

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
	type: string
}

export function CodeEditor({ value, onChange, type }: Props) {
	const { editor, editorLineNumber } = useStyles().classes

	const processCode = (code: string) => {
		let processedCode = code

		if (type === 'json' || type === 'xml') {
			processedCode = highlight(code, languages[type], type)
		}
		if (type === 'text') {
			processedCode = escapeHtml(processedCode)
		}

		processedCode = processedCode
			.split('\n')
			.map((line, i) => `<span class='${editorLineNumber}'>${i + 1}</span>${line}`)
			.join('\n')

		return processedCode
	}

	return (
		<Editor
			className={editor}
			value={value}
			onValueChange={onChange}
			highlight={processCode}
			padding={{ top: 16, bottom: 16, right: 16, left: 54 }}
			style={{
				fontFamily: 'monospace',
				minHeight: '128px',
			}}
		/>
	)
}
