import { useEffect, useRef } from '@wordpress/element'
import cytoscape from 'cytoscape'
import { useDeepCompareEffect } from 'react-use'

const stylesheet = [
	{
		selector: 'node',
		style: {
			label: 'data(label)',
		},
	},
]

interface Props {
	layoutName: string
	height: number
	elements: { nodes: any[]; edges: any[] }
	onSelect?: (node: any, type: string) => void
}

export function CytoscapeComponent(props: Props) {
	const { layoutName, height, elements, onSelect } = props

	const cy = useRef<cytoscape.Core>()
	const divContainer = useRef<HTMLDivElement>(null)

	useEffect(() => {
		cy.current = cytoscape({ style: stylesheet, container: divContainer.current, layout: { name: layoutName as any } })
	}, [])

	useEffect(() => {
		if (cy.current && onSelect) {
			cy.current?.on('select', (event) => onSelect(event.target.data(), event.target.isNode() ? 'node' : 'edge'))
		}
	}, [onSelect])

	useDeepCompareEffect(() => {
		if (cy.current) {
			cy.current.elements().remove()
			cy.current.add(elements)
			cy.current.layout({ name: layoutName as any }).run()
		}
	}, [elements, layoutName])

	return <div ref={divContainer} style={{ height, width: '100%' }} />
}
