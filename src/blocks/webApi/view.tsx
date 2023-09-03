import { Nucleus, usePublish, useWatch } from '@inseri/lighthouse-next'
import { useEffect } from '@wordpress/element'
import { __ } from '@wordpress/i18n'
import { Box, Button, Text, useGlobalState } from '../../components'
import { DatasourceState } from './AdminState'

interface ViewProps {
	isSelected?: boolean
	isGutenbergEditor?: boolean
}

export default function View({ isSelected, isGutenbergEditor }: ViewProps) {
	const { inputMethodUrl, inputQueryParams, inputHeadersParams, inputBody, outputContenType, label, isVisible, autoTrigger, parameters, inputRevision } =
		useGlobalState((state: DatasourceState) => state)
	const { overrideMethodUrl, overrideQueryParams, overrideHeaderParams, overrideBody, fireRequest, updateState } = useGlobalState((state: DatasourceState) => {
		return state.actions
	})
	const { urlError, bodyError } = parameters
	const contentTypeError = !outputContenType ? __('Content type is missing.', 'inseri-core') : ''

	const [publish, setEmpty] = usePublish('data', 'data')

	const triggerRequest = async () => {
		const [errorMsg, data] = await fireRequest()

		if (errorMsg) {
			setEmpty()
		} else {
			publish(data, outputContenType)
		}
	}

	useWatch(
		{ inputMethodUrl, inputQueryParams, inputHeadersParams, inputBody },
		{
			onBlockRemoved: (keyName) => updateState({ [keyName]: '' }),
			onNone: (keyName: string) => {
				switch (keyName) {
					case 'inputMethodUrl':
						overrideMethodUrl(undefined, undefined)
						break
					case 'inputQueryParams':
						overrideQueryParams(undefined)
						break
					case 'inputHeadersParams':
						overrideHeaderParams(undefined)
						break
					case 'inputBody':
						overrideBody(undefined)
						break
				}
			},
			onSome: ({ value }: Nucleus<any>, keyName: string) => {
				updateState({ inputRevision: inputRevision + 1 })

				switch (keyName) {
					case 'inputMethodUrl':
						if (typeof value === 'object') {
							overrideMethodUrl(value.method, value.url)
						} else {
							overrideMethodUrl(undefined, value)
						}
						break
					case 'inputQueryParams':
						overrideQueryParams(value)
						break
					case 'inputHeadersParams':
						overrideHeaderParams(value)
						break
					case 'inputBody':
						overrideBody(value)
						break
				}
			},
			deps: [inputRevision],
		}
	)

	const isCallReady =
		(!inputMethodUrl || parameters.isMethodUrlOverridden) &&
		(!inputQueryParams || parameters.isQueryParamsOverridden) &&
		(!inputHeadersParams || parameters.isHeaderParamsOverridden) &&
		(!inputBody || parameters.isBodyOverridden)

	// must be the last useEffect
	useEffect(() => {
		if (autoTrigger && isCallReady) {
			triggerRequest()
		}
	}, [
		inputRevision,
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
