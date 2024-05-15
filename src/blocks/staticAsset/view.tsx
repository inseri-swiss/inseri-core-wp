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

const forEachArray = (attribute: string, assets: any[]) => (element: Element) => {
	const host = window.location.origin
	const src = element.getAttribute(attribute) as string

	if (src && src.startsWith(host)) {
		assets.push(src)

		const splits = src.split('/')
		const newSrc = `assets/${encodeURIComponent(splits[splits.length - 1])}`
		element.setAttribute(attribute, newSrc)
	}
}

const make = (setCallback: (url: string) => void) => async () => {
	const host = window.location.origin
	const url = window.location.toString()

	const response = await fetch(url)
	const bodyText = await response.text()

	const parser = new DOMParser()
	const doc = parser.parseFromString(bodyText, 'text/html')

	let assets: string[] = []
	doc.querySelectorAll('script').forEach(forEachArray('src', assets))
	doc.querySelectorAll('img').forEach(forEachArray('src', assets))
	doc.querySelectorAll('link[rel="stylesheet"]').forEach(forEachArray('href', assets))

	doc.querySelectorAll('img').forEach((element) => {
		const srcSet =
			element
				.getAttribute('srcset')
				?.split(',')
				.map((e) => e.trim().split(' ') as [string, string]) ?? []

		srcSet.forEach(([url, _]) => {
			if (url && url.startsWith(host)) {
				assets.push(url)
			}
		})

		if (srcSet.length > 1 && srcSet.some(([url, _]) => url.startsWith(host))) {
			const newSrcSet = srcSet
				.map(([url, density]) => {
					if (url.startsWith(host)) {
						const splits = url.split('/')
						const newUrl = `assets/${encodeURIComponent(splits[splits.length - 1])}`
						return newUrl + ' ' + density
					}
					return url + ' ' + density
				})
				.join(', ')

			element.setAttribute('srcset', newSrcSet)
		}
	})

	const htmlText = new XMLSerializer().serializeToString(doc)
	const htmlBlob = new Blob([htmlText])

	const loadedBlobs = await Promise.all(assets.map(loadAsset))

	const zip = JsZip()

	zip.file('index.html', htmlBlob)

	loadedBlobs.forEach(([filename, blob]) => {
		// TODO preserve directory structure
		zip.file('assets/' + filename, blob)
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
