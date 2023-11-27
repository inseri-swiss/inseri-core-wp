import { useEffect, useRef } from '@wordpress/element'
import cytoscape from 'cytoscape'
//@ts-ignore
import dagre from 'cytoscape-dagre'
//@ts-ignore
import klay from 'cytoscape-klay'
import { useDeepCompareEffect, useMap } from 'react-use'

cytoscape.use(dagre)
cytoscape.use(klay)

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
	layout?: {}
	onSelect?: (node: any, type: string) => void
	onHoverChange?: (record: Record<string, boolean>) => void
	userZoomingEnabled?: boolean
}

export function CytoscapeComponent(props: Props) {
	const { layoutName, height, elements = [], onSelect, stylesheet = defaultStylesheet, layout = {}, onHoverChange, userZoomingEnabled = false } = props

	const cy = useRef<cytoscape.Core>()
	const divContainer = useRef<HTMLDivElement>(null)
	const [hoveredRecord, { set: setHovered }] = useMap<Record<string, boolean>>({})

	useEffect(() => {
		cy.current = cytoscape({ style: stylesheet, container: divContainer.current, layout: { name: layoutName as any, ...layout }, userZoomingEnabled })
		cy.current.on('mouseover', 'node', (event) => {
			const id = event.target.data().id
			setHovered(id, true)
		})
		cy.current.on('mouseout', 'node', (event) => {
			const id = event.target.data().id
			setHovered(id, false)
		})
	}, [])

	useDeepCompareEffect(() => {
		if (onHoverChange) {
			onHoverChange(hoveredRecord)
		}
	}, [hoveredRecord])

	useEffect(() => {
		if (cy.current && onSelect) {
			cy.current?.on('select', (event) => onSelect(event.target.data(), event.target.isNode() ? 'node' : 'edge'))
		}
	}, [onSelect])

	useDeepCompareEffect(() => {
		if (cy.current) {
			cy.current.elements().remove()
			cy.current.add(elements)
			cy.current.style(stylesheet)
			cy.current.layout({ name: layoutName as any, ...layout }).run()
		}
	}, [elements, layoutName, stylesheet, layout])

	return <div ref={divContainer} style={{ height, width: '100%' }} />
}
