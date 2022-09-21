import { AriaSelectOptions, useSelect } from 'react-aria'
import { useSelectState, Item } from 'react-stately'
import Button from './base/Button'
import ListBox from './base/ListBox'
import Popover from './base/Popover'
import { useRef } from '@wordpress/element'

interface OwnProps {
	className?: string
	initialText?: string
}

export type SelectProps = AriaSelectOptions<object> & OwnProps

export const Option = Item

export function AdminSelect(props: SelectProps) {
	const state = useSelectState(props)
	const ref = useRef(null)
	const { triggerProps, valueProps, menuProps } = useSelect(props, state, ref)
	const { initialText = '' } = props

	return (
		<div className="ba-admin-select-wrapper">
			<Button {...triggerProps} buttonRef={ref} className="ba-admin-select">
				<span {...valueProps}>{state.selectedItem ? state.selectedItem.rendered : initialText}</span>
			</Button>
			{state.isOpen && (
				<Popover isOpen={state.isOpen} onClose={state.close}>
					<ListBox {...menuProps} state={state} className="ba-admin-listbox" />
				</Popover>
			)}
		</div>
	)
}
