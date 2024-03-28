import { useDisclosure } from '@mantine/hooks'
import { IconEye, IconPencil, IconPlayerPlay, IconX } from '@tabler/icons-react'
import { __ } from '@wordpress/i18n'
import { Button, Group, Kbd, Loader, Popover, Text, Tooltip, useGlobalState } from '../../components'
import { GlobalState } from './state'

interface Props {
	code: string
	showPopover?: boolean
}

export function TopBar({ code, showPopover }: Props) {
	const { label, actions, workerStatus, hasInputError, inputerr, outputs, editable, mode } = useGlobalState((state: GlobalState) => state)
	const { runCode, terminate } = actions
	const [isPopoverOpen, { close: closePopover, open: openPopover }] = useDisclosure(false)

	const areInputsReady = Object.values(hasInputError).every((b) => !b)
	const areOutputsReady = outputs.every((o) => o[1] !== '')
	const outputErrText = 'Content type is not set for all outputs'

	const isReady = areInputsReady && areOutputsReady && workerStatus !== 'initial'
	const isCodeEditable = mode === 'editor' && editable

	const primaryButton = showPopover ? (
		<Popover position="top" withArrow shadow="md" opened={isPopoverOpen}>
			<Popover.Target>
				<Button
					variant="filled"
					leftIcon={<IconPlayerPlay size={18} />}
					onMouseEnter={openPopover}
					onMouseLeave={closePopover}
					onClick={() => runCode(code)}
					disabled={!isReady}
				>
					{__('Run', 'inseri-core')}
				</Button>
			</Popover.Target>
			<Popover.Dropdown sx={{ pointerEvents: 'none' }}>
				<Text size="sm">
					Run Code with <Kbd>Ctrl/Cmd</Kbd> + <Kbd>Enter</Kbd>
				</Text>
			</Popover.Dropdown>
		</Popover>
	) : (
		<Button variant="filled" leftIcon={<IconPlayerPlay size={18} />} onClick={() => runCode(code)} disabled={!isReady}>
			{__('Run', 'inseri-core')}
		</Button>
	)

	return (
		<>
			{label.trim() && <Text fz={14}>{label}</Text>}
			<div style={{ flex: 1 }} />
			{(inputerr || !areOutputsReady) && (
				<Text color="red" fz={12}>
					{inputerr || outputErrText}
				</Text>
			)}
			{workerStatus !== 'ready' && <Loader p={6} />}
			{isCodeEditable ? (
				<Tooltip label={__('The code is editable.', 'inseri-core')}>
					<Group>
						<IconPencil size={22} />
					</Group>
				</Tooltip>
			) : (
				<Tooltip label={__('The code is read-only.', 'inseri-core')}>
					<Group>
						<IconEye size={22} />
					</Group>
				</Tooltip>
			)}
			{workerStatus === 'in-progress' ? (
				<Button variant="outline" onClick={terminate} leftIcon={<IconX size={20} />} color="red">
					{__('Stop', 'inseri-core')}
				</Button>
			) : (
				primaryButton
			)}
		</>
	)
}
