import { highlight, languages } from 'prismjs'
import Editor from 'react-simple-code-editor'
import { createStyles } from '../components'

// before a language can be highlighted, it must be imported as follows
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markup'
import { escapeHtml } from '../utils'

const useStyles = createStyles((theme) => ({
	wrapper: {
		border: '1px solid #ced4da',
		overflow: 'auto',
	},
	editor: {
		fontSize: theme.fontSizes.sm,
		counterReset: 'line',

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
	onChange?: (code: string) => void
	type: string
	textareaId?: string
	height?: number
	maxHeight?: number
}

export function CodeEditor({ value, onChange = () => {}, type, textareaId, height, maxHeight }: Props) {
	const { editor, editorLineNumber, wrapper } = useStyles().classes

	const processCode = (code: string) => {
		let processedCode = code

		if (type === 'json' || type === 'xml' || type === 'html') {
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
		<div className={wrapper} style={{ maxHeight, height }}>
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
				textareaId={textareaId}
			/>
		</div>
	)
}
