import { useWatchMany } from '@inseri/lighthouse'
import { useDisclosure } from '@mantine/hooks'
import { IconPlayerPlay, IconSkull } from '@tabler/icons'
import { __ } from '@wordpress/i18n'
import { Button, Kbd, Loader, Popover, Text, useGlobalState } from '../../components'
import { GlobalState } from './state'

export function TopBar({ showPopover }: { showPopover?: boolean }) {
	const { label, actions, workerStatus, inputs } = useGlobalState((state: GlobalState) => state)
	const { runCode, terminate } = actions
	const [isPopoverOpen, { close: closePopover, open: openPopover }] = useDisclosure(false)

	const watchedValues = useWatchMany(inputs)
	const areWatchedValuesReady = Object.values(watchedValues).reduce((acc, item) => acc && item.status === 'ready', true)
	const isReady = areWatchedValuesReady && workerStatus !== 'initial'

	const primaryButton = showPopover ? (
		<Popover position="top" withArrow shadow="md" opened={isPopoverOpen}>
			<Popover.Target>
				<Button
					variant="filled"
					leftIcon={<IconPlayerPlay size={18} />}
					onMouseEnter={openPopover}
					onMouseLeave={closePopover}
					onClick={runCode}
					disabled={!isReady}
				>
					{__('Run', 'inseri-core')}
				</Button>
			</Popover.Target>
			<Popover.Dropdown sx={{ pointerEvents: 'none' }}>
				<Text size="sm">
					Run Code with <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd>
				</Text>
			</Popover.Dropdown>
		</Popover>
	) : (
		<Button variant="filled" leftIcon={<IconPlayerPlay size={18} />} onClick={runCode} disabled={!isReady}>
			{__('Run', 'inseri-core')}
		</Button>
	)

	return (
		<>
			{label.trim() && <Text fz={14}>{label}</Text>}
			<div style={{ flex: 1 }} />
			{workerStatus === 'in-progress' && <Loader p={6} />}
			{workerStatus === 'in-progress' ? (
				<Button variant="outline" onClick={terminate} leftIcon={<IconSkull size={20} />} color="red">
					{__('Stop', 'inseri-core')}
				</Button>
			) : (
				primaryButton
			)}
		</>
	)
}
