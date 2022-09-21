import { AriaListBoxOptions } from 'react-aria'
import { useRef } from '@wordpress/element'
import type { RefObject } from 'react'

import { useListBox, useOption } from 'react-aria'
import { ListState } from 'react-stately'

interface OwnProps {
	className?: string
	listBoxRef?: RefObject<HTMLUListElement>
	state: ListState<object>
}

export default function ListBox(props: AriaListBoxOptions<object> & OwnProps) {
	const ref = useRef(null)
	const { listBoxRef = ref, state, className } = props
	const { listBoxProps } = useListBox(props, state, listBoxRef)

	return (
		<ul {...listBoxProps} ref={listBoxRef} className={className}>
			{[...state.collection].map((item) => (
				<Option key={item.key} item={item} state={state} />
			))}
		</ul>
	)
}

function Option({ item, state }: any) {
	const ref = useRef(null)
	const { optionProps, isSelected, isFocused, isDisabled } = useOption({ key: item.key }, state, ref)

	let backgroundColor
	let color = 'black'

	if (isSelected) {
		backgroundColor = 'bluevioconst'
		color = 'white'
	} else if (isFocused) {
		backgroundColor = 'gray'
	} else if (isDisabled) {
		backgroundColor = 'transparent'
		color = 'gray'
	}

	return (
		<li
			{...optionProps}
			ref={ref}
			style={{
				background: backgroundColor,
				color: color,
				padding: '2px 5px',
				outline: 'none',
				cursor: 'pointer',
			}}
		>
			{item.rendered}
		</li>
	)
}
