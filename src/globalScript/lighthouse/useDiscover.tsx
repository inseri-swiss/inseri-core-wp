import { IconBuildingLighthouse } from '@tabler/icons-react'
import { select } from '@wordpress/data'
import { useContext, useState } from '@wordpress/element'
import { Schema } from 'ajv'
import { useDeepCompareEffect } from 'react-use'
import { map } from 'rxjs'
import { initJsonValidator } from '../utils'
import { BlockIdContext, blockStoreSubject } from './core'
import type { Atom, BlockInfo, Root } from './types'

interface DiscoverContentType {
	contentTypeFilter: string | ((contentType: string) => boolean)
}

interface DiscoverJson {
	jsonSchemas: Schema[]
}

type DiscoverOptions = DiscoverContentType | DiscoverJson | {}

type RawValueItem = Omit<BlockInfo, 'atoms'> & Atom & { key: string; blockId: string; atomKey: string; contentType: string }

export interface DiscoveredItem {
	value: string
	label: string
	blockName: string
	contentType: string
	blockType: string
	blockTitle: string
	icon?: React.ReactNode
}

export function flattenToRawItem(root: Root): RawValueItem[] {
	return Object.entries(root).flatMap(([blockId, block]) =>
		Object.entries(block.atoms)
			.filter(([_, atom]) => !!atom)
			.map(([atomKey, atom]) => {
				const { atoms, ...restBlock } = block
				return {
					key: blockId + '/' + atomKey,
					atomKey,
					blockId,
					...restBlock,
					...atom,
					contentType: atom.content?.isDefined() ? atom.content.get().contentType : '-',
				}
			})
	)
}

function mapToDiscoveredItem(rawItems: RawValueItem[]): DiscoveredItem[] {
	return rawItems
		.map(({ key, blockName, description, contentType, blockType }) => ({
			value: key,
			label: `${blockName} - ${description}`,
			blockName,
			contentType,
			blockType,
		}))
		.map((item) => {
			if (item.blockType === 'inseri-core/root') {
				return { ...item, blockTitle: 'inseri', icon: <IconBuildingLighthouse style={{ fill: 'none' }} /> }
			}

			const block = select('core/blocks').getBlockType(item.blockType)
			return { ...item, blockTitle: block?.title ?? '', icon: block?.icon?.src as React.ReactElement }
		})
}

function distinctRawItems(rawItems: RawValueItem[]): RawValueItem[] {
	return rawItems.filter((item, idx, self) => self.findIndex((i) => i.key === item.key) === idx)
}

const filterByContentType = (contentTypeFilter: string | ((contentType: string) => boolean)) => (rawItems: RawValueItem[]) => {
	let compareContentType: (ct: string) => boolean
	if (typeof contentTypeFilter === 'string') {
		compareContentType = (ct: string) => ct.includes(contentTypeFilter)
	} else {
		compareContentType = contentTypeFilter
	}

	return rawItems.filter((item) => item.content?.exists((nucleus) => compareContentType(nucleus.contentType)))
}

const filterByJsonSchemas = (jsonSchemas: Schema[]) => {
	const jsonValidators = jsonSchemas.map((s) => initJsonValidator(s))

	return (rawItems: RawValueItem[]) => {
		return rawItems.filter((item) => {
			return jsonValidators.some((check) => item.content?.exists((nucleus) => check(nucleus.value)))
		})
	}
}

export function useDiscover(ops: DiscoverOptions): DiscoveredItem[] {
	const [state, setState] = useState<DiscoveredItem[]>([])
	const blockId = useContext(BlockIdContext)

	useDeepCompareEffect(() => {
		const filters: Array<(d: RawValueItem[]) => RawValueItem[]> = []

		if ('contentTypeFilter' in ops && ops.contentTypeFilter) {
			filters.push(filterByContentType(ops.contentTypeFilter))
		}
		if ('jsonSchemas' in ops && ops.jsonSchemas) {
			filters.push(filterByJsonSchemas(ops.jsonSchemas))
		}

		const sub = blockStoreSubject
			.pipe(
				map(flattenToRawItem),
				map((rawItems) => rawItems.filter((i) => i.blockId !== blockId)),
				map((rawItems) => (filters.length > 0 ? filters.flatMap((filterFn) => filterFn(rawItems)) : rawItems)),
				map(distinctRawItems),
				map((rawItems) => [...rawItems].reverse()),
				map(mapToDiscoveredItem)
			)
			.subscribe(setState)

		return () => sub.unsubscribe()
	}, [ops, blockId])

	return state
}
