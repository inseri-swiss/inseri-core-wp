import { useEffect, useRef } from '@wordpress/element'
import cytoscape from 'cytoscape'
//@ts-ignore
import dagre from 'cytoscape-dagre'
import { useDeepCompareEffect } from 'react-use'

cytoscape.use(dagre)

const defaultStylesheet = [
	{
		selector: 'node',
		style: {
			label: 'data(label)',
			'background-color': '#11479e',
		},
	},
	{
		selector: 'node:parent',
		style: {
			'background-opacity': 0.1,
		},
	},
	{
		selector: 'edge',
		style: {
			width: 4,
			'target-arrow-shape': 'triangle',
			'line-color': '#9dbaea',
			'target-arrow-color': '#9dbaea',
			'curve-style': 'bezier',
		},
	},
]

interface Props {
	layoutName: string
	height: number | string
	elements: any[]
	stylesheet?: any[]
	onSelect?: (node: any, type: string) => void
}

export function CytoscapeComponent(props: Props) {
	const { layoutName, height, elements, onSelect, stylesheet = defaultStylesheet } = props

	const cy = useRef<cytoscape.Core>()
	const divContainer = useRef<HTMLDivElement>(null)

	useEffect(() => {
		cy.current = cytoscape({ style: stylesheet, container: divContainer.current, layout: { name: layoutName as any }, userZoomingEnabled: false })
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
