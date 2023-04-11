import { createStyles, MantineProvider, getStylesRef } from '@mantine/core'
import type { MantineThemeOverride } from '@mantine/core'
import type { PropsWithChildren } from 'react'

const useStyles = createStyles((theme) => ({
	input: {
		ref: getStylesRef('input'),
	},
	inputWrapper: {
		[`& > .${getStylesRef('input')}`]: {
			backgroundColor: '#fff',
			borderRadius: '3px',
			minHeight: 'unset',
		},
		[`& > .${getStylesRef('input')}:focus`]: {
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

	modalInner: {
		boxSizing: 'border-box',
	},
}))

export function InseriThemeProvider({ children }: PropsWithChildren<{}>) {
	const { classes } = useStyles()
	const { inputWrapper, input, buttonRoot, checkboxInner, modalInner } = classes

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
			Modal: {
				classNames: { inner: modalInner },
				styles: { content: { flex: 1, background: '#f0f0f1' }, header: { background: '#f0f0f1' } },
			},
		},
	}

	return <MantineProvider theme={themeOverride}>{children}</MantineProvider>
}
