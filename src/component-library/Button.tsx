import classnames from 'classnames'
import BaseButton, { ButtonProps } from './base/Button'

export function AdminButton(props: ButtonProps) {
	const { className } = props
	return <BaseButton {...props} className={classnames(className, 'ba-admin-button')} />
}

export function Button(props: ButtonProps) {
	const { className } = props
	return <BaseButton {...props} className={classnames(className, 'ba-button')} />
}
