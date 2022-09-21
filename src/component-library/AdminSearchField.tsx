import { useSearchFieldState } from 'react-stately'
import { AriaSearchFieldProps, useSearchField } from 'react-aria'
import { useRef } from '@wordpress/element'
import classNames from 'classnames'

interface OwnProps {
	className?: string
}

export type SearchFieldProps = AriaSearchFieldProps & OwnProps

export function AdminSearchField(props: SearchFieldProps) {
	const state = useSearchFieldState(props)
	const ref = useRef<HTMLInputElement>(null)

	const { inputProps } = useSearchField(props, state, ref)
	const { className } = props

	return <input {...inputProps} ref={ref} className={classNames(className, 'ba-admin-input')} />
}
