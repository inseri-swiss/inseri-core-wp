import { createStyles, MantineProvider } from '@mantine/core'
import type { MantineThemeOverride } from '@mantine/core'
import type { PropsWithChildren } from 'react'

const useStyles = createStyles((theme, _params, getRef) => ({
	input: {
		ref: getRef('input'),
	},
	inputWrapper: {
		[`& > .${getRef('input')}`]: {
			backgroundColor: '#fff',
			borderRadius: '3px',
		},
		[`& > .${getRef('input')}:focus`]: {
			borderColor: theme.colors.blue[8],
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

export function InseriThemeProvider({ children }: PropsWithChildren<{}>) {
	const { classes } = useStyles()
	const { inputWrapper, input, buttonRoot, checkboxInner } = classes

	const themeOverride: MantineThemeOverride = {
		defaultRadius: 3,
		primaryShade: 8,
		components: {
			Select: {
				classNames: { input, wrapper: inputWrapper },
			},
			TextInput: {
				classNames: { input, wrapper: inputWrapper },
			},
			Button: {
				classNames: { root: buttonRoot },
			},
			Checkbox: {
				classNames: { inner: checkboxInner },
			},
		},
	}

	return <MantineProvider theme={themeOverride}>{children}</MantineProvider>
}
