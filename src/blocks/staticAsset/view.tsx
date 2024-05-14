import { Button } from '../../components'
import { Attributes } from './index'
import JsZip from 'jszip'
import { useState } from '@wordpress/element'

async function loadAsset(url: string): Promise<[string, Blob]> {
	const splits = url.split('/')
	const filename = splits[splits.length - 1]

	const response = await fetch(url)
	const blob = await response.blob()
	return [filename, blob]
}

const make = (setCallback: (url: string) => void) => async () => {
	const host = window.location.origin
	const url = window.location.toString()

	const response = await fetch(url)
	const bodyText = await response.text()

	const parser = new DOMParser()
	const doc = parser.parseFromString(bodyText, 'text/html')

	let assets: string[] = []
	doc.querySelectorAll('script').forEach((element) => {
		assets.push(element.getAttribute('src') as string)
	})

	assets = assets.filter((a) => !!a).filter((a) => a.startsWith(host))
	const loadedBlobs = await Promise.all(assets.map(loadAsset))

	const zip = JsZip()
	loadedBlobs.forEach(([filename, blob]) => {
		zip.file(filename, blob)
	})

	const resultingZip = await zip.generateAsync({ type: 'blob' })
	setCallback(URL.createObjectURL(resultingZip))
}

export default function View(_props: { attributes: Attributes; setAttributes?: (item: Partial<Attributes>) => void }) {
	const [blobUrl, setBlobUrl] = useState<string>('')

	return !blobUrl ? (
		<Button style={{ color: '#fff' }} onClick={make(setBlobUrl)}>
			Make Zip
		</Button>
	) : (
		<Button style={{ color: '#fff' }} component="a" href={blobUrl} download={'archive.zip'}>
			Download Zip
		</Button>
	)
}
