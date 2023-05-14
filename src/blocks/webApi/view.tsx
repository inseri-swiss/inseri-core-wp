import { useDispatch, useWatch } from '@inseri/lighthouse'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Button, Text, useGlobalState } from '../../components'
import { isBeaconReady } from '../../utils'
import { DatasourceState } from './AdminState'

interface ViewProps {
	isSelected?: boolean
	isGutenbergEditor?: boolean
}

export default function View({ isSelected, isGutenbergEditor }: ViewProps) {
	const { inputMethodUrl, inputQueryParams, inputHeadersParams, inputBody, output, label, isVisible, autoTrigger, parameters } = useGlobalState(
		(state: DatasourceState) => state
	)
	const { overrideMethodUrl, overrideQueryParams, overrideHeaderParams, overrideBody, fireRequest } = useGlobalState((state: DatasourceState) => {
		return state.actions
	})
	const { urlError, bodyError } = parameters
	const contentTypeError = !output.contentType ? __('Content type is missing.', 'inseri-core') : ''

	const dispatch = useDispatch(output)

	const triggerRequest = async () => {
		dispatch({ status: 'loading' })

		const [errorMsg, data] = await fireRequest()

		if (errorMsg) {
			dispatch({ status: 'error' })
		} else {
			dispatch({ status: 'ready', value: data })
		}
	}

	const watchMethodUrl = useWatch(inputMethodUrl)
	const watchQueryParams = useWatch(inputQueryParams)
	const watchHeadersParams = useWatch(inputHeadersParams)
	const watchBody = useWatch(inputBody)

	const isCallReady =
		isBeaconReady(inputMethodUrl, watchMethodUrl) &&
		isBeaconReady(inputQueryParams, watchQueryParams) &&
		isBeaconReady(inputHeadersParams, watchHeadersParams) &&
		isBeaconReady(inputBody, watchBody)

	useEffect(() => {
		dispatch({ contentType: output.contentType })
	}, [output.contentType])

	useEffect(() => {
		if (watchMethodUrl.status === 'ready') {
			if (typeof watchMethodUrl.value === 'object') {
				overrideMethodUrl(watchMethodUrl.value.method, watchMethodUrl.value.url)
			} else {
				overrideMethodUrl(undefined, watchMethodUrl.value)
			}
		}

		if (!inputMethodUrl.key) {
			overrideMethodUrl(undefined, undefined)
		}
	}, [watchMethodUrl.status, watchMethodUrl.value, inputMethodUrl.key])

	useEffect(() => {
		if (watchQueryParams.status === 'ready') {
			overrideQueryParams(watchQueryParams.value)
		}

		if (!inputQueryParams.key) {
			overrideQueryParams(undefined)
		}
	}, [watchQueryParams.status, watchQueryParams.value, inputQueryParams.key])

	useEffect(() => {
		if (watchHeadersParams.status === 'ready') {
			overrideHeaderParams(watchHeadersParams.value)
		}

		if (!inputHeadersParams.key) {
			overrideHeaderParams(undefined)
		}
	}, [watchHeadersParams.status, watchHeadersParams.value, inputHeadersParams.key])

	useEffect(() => {
		if (watchBody.status === 'ready') {
			overrideBody(watchBody.value)
		}

		if (!inputBody.key) {
			overrideBody(undefined)
		}
	}, [watchBody.status, watchBody.value, inputBody.key])

	// must be the last useEffect
	useEffect(() => {
		if (autoTrigger && isCallReady) {
			triggerRequest()
		}
	}, [
		watchMethodUrl.value,
		watchQueryParams.value,
		watchHeadersParams.value,
		watchBody.value,
		isCallReady,
	])

	return isVisible || isSelected ? (
		<Box p="md">
			<Button variant="filled" disabled={!isCallReady} onClick={triggerRequest}>
				{label}
			</Button>
			{bodyError && (
				<Text mt="xs" color="red" size="sm">
					{bodyError}
				</Text>
			)}
			{urlError && (
				<Text mt="xs" color="red" size="sm">
					{urlError}
				</Text>
			)}
			{contentTypeError && (
				<Text mt="xs" color="red" size="sm">
					{contentTypeError}
				</Text>
			)}
		</Box>
	) : isGutenbergEditor ? (
		<Box
			style={{
				height: '68px',
				border: '1px dashed currentcolor',
				borderRadius: '2px',
			}}
		>
			<Box />
			<svg width="100%" height="100%">
				<line strokeDasharray="3" x1="0" y1="0" x2="100%" y2="100%" style={{ stroke: 'currentColor' }} />
			</svg>
		</Box>
	) : (
		<div />
	)
}
