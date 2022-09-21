import { AriaOverlayProps, DismissButton, FocusScope, useOverlay } from 'react-aria'
import { useRef } from '@wordpress/element'
import type { RefObject, PropsWithChildren } from 'react'

interface OwnProps {
	className?: string
	popoverRef?: RefObject<HTMLDivElement>
}

export default function Popover(props: AriaOverlayProps & PropsWithChildren<OwnProps>) {
	const ref = useRef(null)
	const { popoverRef = ref, isOpen, onClose, children, className } = props

	const { overlayProps } = useOverlay(
		{
			isOpen,
			onClose,
			shouldCloseOnBlur: true,
			isDismissable: true,
		},
		popoverRef
	)

	return (
		<FocusScope restoreFocus>
			<div {...overlayProps} ref={popoverRef} className={className}>
				{children}
				<DismissButton onDismiss={onClose} />
			</div>
		</FocusScope>
	)
}
