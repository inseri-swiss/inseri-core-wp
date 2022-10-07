import { render } from '@wordpress/element'
import domReady from '@wordpress/dom-ready'
import { MantineProvider, Global, createStyles, MantineThemeOverride } from '../components'
import { AdminPanel } from './AdminPanel'

const useStyles = createStyles((theme, _params, getRef) => ({
	input: {
		ref: getRef('input'),
	},
	inputWrapper: {
		[`& > .${getRef('input')}`]: {
			backgroundColor: '#fff',
			borderRadius: '3px',
			fontSize: '14px',
		},
	},
	buttonRoot: {
		fontWeight: 'normal',
		fontSize: '14px',
	},
	checkboxInner: {
		[`& > input[type="checkbox"]`]: {
			border: '1px solid' + theme.colors.gray[4],
			margin: 0,
			width: '20px',
			height: '20px',
			borderRadius: '3px',
			verticalAlign: 'unset',
		},

		[`& > input[type="checkbox"]:checked::before`]: {
			content: 'unset',
		},

		[`& > input[type="checkbox"]:focus`]: {
			boxShadow: 'unset',
		},
	},
}))

const AdminGlobalStyles = () => (
	<Global
		styles={(_theme) => ({
			body: { backgroundColor: '#f0f0f1' },

			'#wpcontent': {
				paddingLeft: '0',
			},

			'@media screen and (max-width: 782px)': {
				'.auto-fold #wpcontent': {
					paddingLeft: '0',
				},
			},
		})}
	/>
)

function Root() {
	const { classes } = useStyles()
	const { inputWrapper, input, buttonRoot, checkboxInner } = classes

	const themeOverride: MantineThemeOverride = {
		defaultRadius: 3,
		primaryShade: 8,
		components: {
			Select: {
				defaultProps: { size: 'xs', labelProps: { size: 'sm' } },
				classNames: { input, wrapper: inputWrapper },
			},
			TextInput: {
				defaultProps: { size: 'xs', labelProps: { size: 'sm' } },
				classNames: { input, wrapper: inputWrapper },
			},
			Button: {
				defaultProps: { size: 'xs' },
				classNames: { root: buttonRoot },
			},
			Checkbox: {
				classNames: { inner: checkboxInner },
			},
		},
	}

	return (
		<MantineProvider withNormalizeCSS withGlobalStyles theme={themeOverride}>
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
