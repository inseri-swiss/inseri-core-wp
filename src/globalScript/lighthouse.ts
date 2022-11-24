import { useEffect, useMemo } from '@wordpress/element'
import produce, { setAutoFreeze } from 'immer'
import type { Draft } from 'immer'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface BeaconState extends BaseBeaconState {
	description?: string
	default?: string
}

interface BaseBeaconState {
	contentType: string
	status: 'initial' | 'loading' | 'ready' | 'error' | 'unavailable'
	error?: string
	value?: any
}

interface InitBeaconConfig {
	key: string
	default?: any
	contentType: string
	description: string
}

interface ProducerBeacon {
	key: string
	contentType: string
	default?: any
}
interface ConsumerBeacon extends ProducerBeacon {
	description: string
}

interface BlockConfig {
	blockType: string
	instanceName: string
}

interface InitBlockConfig extends BlockConfig {
	blockId: string
}

interface StoreWrapper {
	blocks: Record<string, BlockConfig>
	beacons: Record<string, BeaconState>
}

let store: any = (_set: any) => ({
	blocks: {},
	beacons: {},
})

if (process.env.NODE_ENV !== 'production') {
	store = devtools(store, { name: 'inseri-store' })
	setAutoFreeze(true)
} else {
	setAutoFreeze(false)
}

const useInternalStore = create(immer<StoreWrapper>(store))

const compoundKey = (blockId: string, key: string) => `${blockId}/${key}`

const createBeacon =
	(blockId: string) =>
	(config: InitBeaconConfig): ProducerBeacon => {
		return useMemo(() => {
			const { key, ...rest } = config
			useInternalStore.setState((state) => {
				state.beacons[compoundKey(blockId, key)] = { ...rest, status: 'initial', value: rest.default }
			})

			return { key: compoundKey(blockId, key), default: rest.default, contentType: rest.contentType }
		}, [])
	}

const revokeBeacon =
	(_blockId: string) =>
	({ key }: ProducerBeacon) => {
		useInternalStore.setState((state) => {
			if (state.beacons[key]) {
				state.beacons[key].status = 'unavailable'
			}
		})
	}

function useLighthouse(config: InitBlockConfig): [(config: InitBeaconConfig) => ProducerBeacon, (config: ProducerBeacon) => void] {
	const { blockId, ...rest } = config

	useEffect(() => {
		// do clean up on unmount
		return () => {
			useInternalStore.setState((state) => {
				Object.entries(state.beacons)
					.filter(([compoundKey, _]) => compoundKey.startsWith(blockId + '/'))
					.forEach(([_, beacon]) => {
						beacon.status = 'unavailable'
					})
			})
		}
	}, [])

	useEffect(() => {
		useInternalStore.setState((state) => {
			state.blocks[blockId] = rest
		})
	}, [rest.instanceName])

	return [createBeacon(blockId), revokeBeacon(blockId)]
}

function createDispatch(config: ProducerBeacon) {
	const { key, contentType } = config
	useEffect(() => {
		useInternalStore.setState((state) => {
			if (!state.beacons[key]) {
				state.beacons[key] = { default: config.default, contentType, value: config.default, status: 'initial' }
			}
		})
	}, [key])

	return (update: Partial<BaseBeaconState>) => {
		useInternalStore.setState((state) =>
			Object.entries(update)
				.filter(([_, itemVal]) => !!itemVal)
				.forEach(([itemKey, itemVal]) => {
					state.beacons[key][itemKey as keyof BaseBeaconState] = itemVal
				})
		)
	}
}

function useAvailableBeacons(contentTypeFilter?: string | ((contentType: string) => boolean)): Record<string, ConsumerBeacon> {
	const blocks = useInternalStore((state) => state.blocks)
	const beacons = useInternalStore((state) => state.beacons)

	return produce(beacons, (dictDraft: Draft<Record<string, BeaconState & ConsumerBeacon>>) => {
		Object.keys(beacons).forEach((key) => {
			const beacon: any = dictDraft[key]
			let isExpectedContentType = true

			if (contentTypeFilter) {
				const compareContentType = typeof contentTypeFilter === 'string' ? (ct: string) => ct.includes(contentTypeFilter) : contentTypeFilter
				isExpectedContentType = compareContentType(beacon.contentType)
			}

			if (beacon.status === 'unavailable' || !isExpectedContentType) {
				delete dictDraft[key]
			} else {
				const blockId = key.split('/')[0]
				const instanceName = blocks[blockId]?.instanceName ?? ''
				beacon.description = `${instanceName}: ${beacon.description}`

				beacon['key'] = key
				delete beacon.error
				delete beacon.value
				delete beacon.status
			}
		})
	}) as any
}

function useBeacon(config?: ConsumerBeacon): BaseBeaconState {
	const { key, contentType, default: defaultVal } = config ?? { key: '', contentType: '' }
	const state = useInternalStore((state) => state.beacons[key])

	if (!state) {
		return { contentType, value: defaultVal, status: 'initial' }
	}

	return state
}

export default {
	useLighthouse,
	createDispatch,
	useAvailableBeacons,
	useBeacon,
} as const
