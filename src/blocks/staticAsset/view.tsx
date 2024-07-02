import { Button } from '../../components'
import { Attributes } from './index'
import JsZip from 'jszip'
import { useState } from '@wordpress/element'

async function loadAsset(url: string): Promise<[string, Blob]> {
	const splits = url.split('/').splice(3)
	const last = embedVersionInFileName(splits.pop() ?? '')
	const filename = [...splits, last].join('/')

	const response = await fetch(url)
	const blob = await response.blob()
	return [filename, blob]
}

function embedVersionInFileName(file: string) {
	if (file.includes('?')) {
		const [fileWithExt, versionTail] = file.split('?')
		const [_, version] = versionTail.split('=')
		const [filename, ext] = fileWithExt.split('.')

		return `${filename}.${version}.${ext}`
	}
	return file
}

function removeHost(src: string) {
	const splits = src.split('/')
	const last = embedVersionInFileName(splits.pop() ?? '')

	const newSrc = [...splits.splice(3), last].join('/')
	return newSrc
}

const forEachArray = (attribute: string, assets: any[]) => (element: Element) => {
	const host = window.location.origin
	const src = element.getAttribute(attribute) as string

	if (src && src.startsWith(host)) {
		assets.push(src)
		element.setAttribute(attribute, removeHost(src))
	}
}

const make = (setCallback: (url: string) => void) => async () => {
	const host = window.location.origin
	const url = window.location.toString()

	const response = await fetch(url)
	const bodyText = await response.text()

	const parser = new DOMParser()
	const doc = parser.parseFromString(bodyText, 'text/html')
	doc.querySelector('#wpadminbar')?.remove()
	doc.querySelector('#admin-bar-inline-css')?.remove()

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
						const newUrl = removeHost(url)
						return newUrl + ' ' + density
					}
					return url + ' ' + density
				})
				.join(', ')

			element.setAttribute('srcset', newSrcSet)
		}
	})

	doc.querySelectorAll('style').forEach((element) => {
		if (element.textContent?.match(/url\((["'])(.*?[^\\])\1\)/)) {
			const replacedContent = element.textContent.replaceAll(/url\((["'])(.*?[^\\])\1\)/g, (_match, _capture1, url) => {
				if (url.startsWith(host)) {
					assets.push(url)

					const newUrl = `url('${removeHost(url)}')`
					return newUrl
				}

				return `url('${url}')`
			})

			element.innerHTML = replacedContent
		}
	})

	const inseriApiSettings = doc.querySelector('#inseri-core-js-extra')
	if (doc.querySelector('.wp-block-inseri-core-python') && inseriApiSettings) {
		const content = inseriApiSettings.textContent ?? ''
		const newContent = content.replace(/"pyWorker":"(.*?)"/, (_match, url) => {
			assets.push(url.replaceAll('\\', ''))
			return `"pyWorker":"${removeHost(url)}"`
		})
		inseriApiSettings.innerHTML = newContent
	}

	const htmlText = new XMLSerializer().serializeToString(doc.doctype!) + doc.getElementsByTagName('html')[0].outerHTML
	const htmlBlob = new Blob([htmlText])

	const loadedBlobs = await Promise.all(assets.map(loadAsset))

	const zip = JsZip()

	zip.file('index.html', htmlBlob)

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
