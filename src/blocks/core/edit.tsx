import { useBlockProps } from '@wordpress/block-editor'
import './editor.scss'
import { Button, Select, TextInput } from '../../components'
import { useEffect, useState } from '@wordpress/element'
import type { BlockEditProps } from '@wordpress/blocks'
import { useAvailableBeacons, useDispatch, useControlTower, useWatch } from '@inseri/lighthouse'

export default function Edit({ setAttributes, clientId }: BlockEditProps<{ handle: string; input: any; output: any }>) {
	const [name, setName] = useState('')
	const [beaconKey, setBeaconKey] = useState('')

	const [isToggled, toggle] = useState(true)
	const [myBeacons, setMyBeacons] = useState([{ contentType: 'json', description: 'foo', key: 'foo' }])

	const producersBeacons = useControlTower({ blockId: clientId, blockType: 'inseri/core', instanceName: name }, myBeacons)

	const fooBeacon = producersBeacons[0]
	const fooDispatch = useDispatch(fooBeacon)

	useEffect(() => {
		setAttributes({ handle: clientId })
	}, [])

	useEffect(() => {
		setAttributes({ output: fooBeacon })
	}, [fooBeacon.key])

	const availableBeacons = useAvailableBeacons()

	useEffect(() => {
		if (beaconKey) {
			setAttributes({ input: availableBeacons[beaconKey] })
		}
	}, [beaconKey])

	const selectData = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))
	const receivingValue = useWatch(availableBeacons?.[beaconKey])

	return (
		<div {...useBlockProps()}>
			<TextInput value={name} placeholder="Instance Name" onChange={(e) => setName(e.currentTarget.value)} />
			<Button onClick={() => fooDispatch({ value: Math.random() })}>Set new value</Button>
			<br />
			<Button
				onClick={() => {
					toggle(!isToggled)
					if (isToggled) {
						setMyBeacons([...myBeacons, { contentType: 'text', description: 'bar bar bar', key: 'fooBar' }])
					} else {
						setMyBeacons(myBeacons.filter((b) => b.key !== 'fooBar'))
					}
				}}
			>
				{isToggled ? 'Add' : 'Remove'} beacon
			</Button>
			<Select data={selectData} onChange={(k) => setBeaconKey(k!)} />
			<span>Value: {receivingValue.value}</span>
		</div>
	)
}
