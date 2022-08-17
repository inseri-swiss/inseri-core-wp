import { useButton } from 'react-aria'
import type { AriaButtonProps } from 'react-aria'
import { useRef } from '@wordpress/element'
import classnames from 'classnames'

interface OwnProps {
	className?: string
}

export const Button: React.FC<AriaButtonProps & OwnProps> = (props) => {
	const ref = useRef<HTMLButtonElement>(null)
	const { buttonProps } = useButton(props, ref)
	const { children, className } = props

	return (
		<button
			{...buttonProps}
			className={classnames(className, 'inseri-button')}
			ref={ref}
		>
			{children}
		</button>
	)
}
