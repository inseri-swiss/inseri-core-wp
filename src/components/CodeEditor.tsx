import { highlight, languages } from 'prismjs'
import Editor from 'react-simple-code-editor'
import { createStyles } from '../components'

// before a language can be highlighted, it must be imported as follows
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-r'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-csv'
import { escapeHtml } from '../utils'

const supportedHighlighted = [
	'html',
	'markdown',
	'r',
	'python',
	'javascript',
	'typescript',
	'sql',
	'yaml',
	'xml',
	'json',
	'csv',
]

const useStyles = createStyles((theme) => ({
	wrapper: {
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
	withBorder?: boolean
	showLineNo?: boolean
	onKeyDown?: React.KeyboardEventHandler<any>
}

export function CodeEditor({ value, onChange = () => {}, type, textareaId, height, maxHeight, withBorder = true, showLineNo = true, onKeyDown }: Props) {
	const { editor, editorLineNumber, wrapper } = useStyles().classes

	const processCode = (code: string) => {
		let processedCode = code

		if (supportedHighlighted.includes(type)) {
			processedCode = highlight(code, languages[type], type)
		} else {
			processedCode = escapeHtml(processedCode)
		}

		if (showLineNo) {
			processedCode = processedCode
				.split('\n')
				.map((line, i) => `<span class='${editorLineNumber}'>${i + 1}</span>${line}`)
				.join('\n')
		}

		return processedCode
	}

	return (
		<div className={wrapper} style={{ maxHeight, height, border: withBorder ? '1px solid #ced4da' : undefined }}>
			<Editor
				className={editor}
				value={value}
				onValueChange={onChange}
				highlight={processCode}
				onKeyDown={onKeyDown}
				padding={{ top: 16, bottom: 16, right: 16, left: showLineNo ? 54 : 16 }}
				style={{
					background: '#fff',
					fontFamily: 'monospace',
					minHeight: '60px',
				}}
				textareaId={textareaId}
			/>
		</div>
	)
}
