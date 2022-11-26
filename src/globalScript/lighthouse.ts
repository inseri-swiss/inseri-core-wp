import { useEffect, useMemo } from '@wordpress/element'
import produce, { setAutoFreeze } from 'immer'
import type { Draft } from 'immer'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { Schema } from 'ajv'
import { initJsonValidator } from './utils'

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
	blockId?: string
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

function useControlTower(blockConfig: InitBlockConfig, beaconConfigs: InitBeaconConfig[]) {
	const { blockId, ...blockRest } = blockConfig

	useEffect(() => {
		// do clean up on unmount
		return () => {
			useInternalStore.setState((state) => {
				Object.entries(state.beacons)
					.filter(([key, _]) => key.startsWith(blockId + '/'))
					.forEach(([_, beacon]) => {
						beacon.status = 'unavailable'
					})
			})
		}
	}, [blockId])

	useEffect(() => {
		if (!blockId) {
			return
		}

		useInternalStore.setState((state) => {
			state.blocks[blockId] = blockRest
		})
	}, [blockRest.instanceName, blockId])

	const joinedKeys = beaconConfigs.reduce((acc, c) => acc + c.key, '')

	return useMemo(() => {
		if (!blockId) {
			return []
		}

		const beacons = useInternalStore.getState().beacons
		const existingKeys = Object.entries(beacons)
			.filter(([key, _]) => key.startsWith(blockId + '/'))
			.filter(([_, val]) => val.status !== 'unavailable')
			.map(([key, _]) => key)

		const incomingKeys = beaconConfigs.map((config) => compoundKey(blockId, config.key))
		const missingKeys = existingKeys.filter((key) => !incomingKeys.includes(key))
		const newBeaconConfigs = beaconConfigs.filter((config) => !existingKeys.includes(compoundKey(blockId, config.key)))

		useInternalStore.setState((state) => {
			missingKeys.forEach((k) => {
				state.beacons[k].status = 'unavailable'
			})
		})

		useInternalStore.setState((state) => {
			newBeaconConfigs.forEach(({ key, ...rest }) => {
				state.beacons[compoundKey(blockId, key)] = { ...rest, status: 'initial', value: rest.default }
			})
		})

		return beaconConfigs.map((config) => {
			return { key: compoundKey(blockId, config.key), default: config.default, contentType: config.contentType }
		})
	}, [joinedKeys, blockId])
}

function useDispatch(config?: ProducerBeacon) {
	useEffect(() => {
		useInternalStore.setState((state) => {
			if (config && !state.beacons[config.key]) {
				const { key, contentType } = config
				state.beacons[key] = { default: config.default, contentType, value: config.default, status: 'initial' }
			}
		})
	}, [config?.key])

	return (update: Partial<BaseBeaconState>) => {
		if (config) {
			useInternalStore.setState((state) => {
				Object.entries(update)
					.filter(([_, itemVal]) => !!itemVal)
					.forEach(([itemKey, itemVal]) => {
						state.beacons[config.key][itemKey as keyof BaseBeaconState] = itemVal
					})
			})
		}
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

				beacon.key = key
				delete beacon.error
				delete beacon.value
				delete beacon.status
			}
		})
	}) as any
}

function useJsonBeacons(schema: Schema) {
	const blocks = useInternalStore((state) => state.blocks)
	const beacons = useInternalStore((state) => state.beacons)

	const jsonValidator = useMemo(() => initJsonValidator(schema), [schema])

	return produce(beacons, (dictDraft: Draft<Record<string, BeaconState & ConsumerBeacon>>) => {
		Object.keys(beacons).forEach((key) => {
			const beacon: any = dictDraft[key]
			const isValid = jsonValidator(beacon.value)

			if (beacon.status === 'unavailable' || !isValid) {
				delete dictDraft[key]
			} else {
				const blockId = key.split('/')[0]
				const instanceName = blocks[blockId]?.instanceName ?? ''
				beacon.description = `${instanceName}: ${beacon.description}`

				beacon.key = key
				delete beacon.error
				delete beacon.value
				delete beacon.status
			}
		})
	}) as any
}

function useWatch(config?: ConsumerBeacon): BaseBeaconState {
	const { key, contentType, default: defaultVal } = config ?? { key: '', contentType: '' }
	const beaconState = useInternalStore((state) => state.beacons[key])

	if (!beaconState) {
		return { contentType, value: defaultVal, status: 'initial' }
	}

	return beaconState
}

export { useControlTower, useDispatch, useAvailableBeacons, useJsonBeacons, useWatch }
