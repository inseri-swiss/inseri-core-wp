import { render } from '@wordpress/element'
import domReady from '@wordpress/dom-ready'
import { MantineProvider, Global, createStyles } from '../components'
import { AdminPanel } from './AdminPanel'

const useStyles = createStyles({
	input: {
		backgroundColor: '#fff !important',
		borderRadius: '3px !important',
		fontSize: '14px',
	},
	root: {
		fontWeight: 'normal',
		fontSize: '14px',
	},
})

const AdminGlobalStyles = () => (
	<Global
		styles={(_theme) => ({
			body: { backgroundColor: '#f0f0f1' },
		})}
	/>
)

function Root() {
	const { input, root } = useStyles().classes
	return (
		<MantineProvider
			withNormalizeCSS
			withGlobalStyles
			theme={{
				colors: {
					main: [
						'#e7f5ff',
						'#d0ebff',
						'#a5d8ff',
						'#74c0fc',
						'#4dabf7',
						'#339af0',
						'#2271b1',
						'#1c7ed6',
						'#1971c2',
						'#1864ab',
					],
				},
				primaryColor: 'main',
				defaultRadius: 3,
				components: {
					Select: {
						defaultProps: { size: 'xs' },
						classNames: { input },
					},
					TextInput: {
						defaultProps: { size: 'xs' },
						classNames: { input },
					},
					Button: {
						defaultProps: { size: 'xs' },
						classNames: { root },
					},
				},
			}}
		>
			<AdminGlobalStyles />
			<AdminPanel />
		</MantineProvider>
	)
}

function init() {
	const root = document.querySelector('#inseri-core-root')
	render(<Root />, root)
}

domReady(init)
