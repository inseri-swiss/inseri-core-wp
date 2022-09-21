import { useButton } from 'react-aria'
import type { AriaButtonProps } from 'react-aria'
import { useRef } from '@wordpress/element'
import type { RefObject } from 'react'

interface OwnProps {
	className?: string
	buttonRef?: RefObject<HTMLButtonElement>
}

export type ButtonProps = AriaButtonProps & OwnProps

export default function Button(props: ButtonProps) {
	const ref = useRef<HTMLButtonElement>(null)
	const { children, className, buttonRef = ref } = props
	const { buttonProps } = useButton(props, ref)

	return (
		<button {...buttonProps} className={className} ref={buttonRef}>
			{children}
		</button>
	)
}
