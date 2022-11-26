import { useBlockProps } from '@wordpress/block-editor'
import './editor.scss'
import { Button, Select, TextInput } from '../../components'
import { useEffect, useState } from '@wordpress/element'
import type { BlockEditProps } from '@wordpress/blocks'
import { useJsonBeacons, useDispatch, useControlTower, useWatch } from '@inseri/lighthouse'
import { initJsonValidator, generateId } from '@inseri/utils'

const schema = {
	type: 'object',
	properties: {
		foo: { type: 'number' },
	},
	required: ['foo'],
	additionalProperties: true,
}

interface Foo {
	foo: number
}

const jsonValidator = initJsonValidator<Foo>(schema)

export default function Edit({ attributes, setAttributes }: BlockEditProps<{ handle: string; input: any; output: any }>) {
	const [name, setName] = useState('')
	const [beaconKey, setBeaconKey] = useState('')

	const [isToggled, toggle] = useState(true)
	const [myBeacons, setMyBeacons] = useState<any[]>([{ contentType: 'json', description: 'foo', key: 'foo' }])

	const producersBeacons = useControlTower({ blockId: attributes.handle, blockType: 'inseri/core', instanceName: name }, myBeacons)

	const fooBeacon = producersBeacons[0]
	const fooDispatch = useDispatch(fooBeacon)

	useEffect(() => {
		if (!attributes.handle) {
			setAttributes({ handle: generateId() })
		}
	}, [])

	useEffect(() => {
		if (fooBeacon?.key !== attributes.output.key) {
			setAttributes({ output: fooBeacon })
		}
	}, [fooBeacon?.key])

	const availableBeacons = useJsonBeacons(schema) //useAvailableBeacons()

	useEffect(() => {
		if (beaconKey) {
			setAttributes({ input: availableBeacons[beaconKey] })
		}
	}, [beaconKey])

	const selectData = Object.keys(availableBeacons).map((k) => ({ label: availableBeacons[k].description, value: k }))
	const receivingValue = useWatch(availableBeacons?.[beaconKey])

	useEffect(() => {
		if (jsonValidator(receivingValue.value)) {
			console.log(receivingValue.value) // eslint-disable-line
		} else {
			console.log(jsonValidator.errors) // eslint-disable-line
		}
	}, [receivingValue.value])

	return (
		<div {...useBlockProps()}>
			<TextInput value={name} placeholder="Instance Name" onChange={(e) => setName(e.currentTarget.value)} />
			<Button onClick={() => fooDispatch({ value: { foo: Math.random(), bar: 'meow' } })}>Set new value</Button>
			<br />
			<Button
				onClick={() => {
					toggle(!isToggled)
					if (isToggled) {
						setMyBeacons([...myBeacons, { contentType: 'text', description: 'bar bar bar', key: 'fooBar', default: { foo: 33 } }])
					} else {
						setMyBeacons(myBeacons.filter((b) => b.key !== 'fooBar'))
					}
				}}
			>
				{isToggled ? 'Add' : 'Remove'} beacon
			</Button>
			<Select data={selectData} onChange={(k) => setBeaconKey(k!)} />
			<span>Value: {receivingValue.value?.foo}</span>
		</div>
	)
}
