import { InseriRoot } from '@inseri/lighthouse'
import { InspectorControls } from '@wordpress/block-editor'
import type { BlockEditProps } from '@wordpress/blocks'
import { PanelBody, PanelRow, ResizableBox, TextControl, TextareaControl, ToggleControl } from '@wordpress/components'
import { __ } from '@wordpress/i18n'
import { MultiSelect, createStyles } from '@mantine/core'
import { SetupEditorEnv } from '../../components/SetupEditorEnv'
import { StateProvider, useGlobalState } from '../../components/StateProvider'
import { COMMON_CONTENT_TYPES } from '../../utils'
import { default as config, default as json } from './block.json'
import { Attributes } from './index'
import { GlobalState, storeCreator } from './state'
import View from './view'

const useStyles = createStyles(() => ({
	label: {
		textTransform: 'uppercase',
		fontSize: '11px',
		fontWeight: 500,
		lineHeight: '1.4',
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
		marginBottom: 'calc(8px)',
	},
	multiSelectValues: {
		[`& > input[type="search"]`]: {
			backgroundColor: 'unset',
			minHeight: 'unset',
			border: 0,
		},

		[`& > input[type="search"]:focus`]: {
			backgroundColor: 'unset',
			minHeight: 'unset',
			border: 0,
			boxShadow: 'unset',
		},
	},
}))

function EditComponent({ isSelected }: BlockEditProps<Attributes>) {
	const { metadata, actions, accepts, mainText, subText, multiple } = useGlobalState((state: GlobalState) => state)
	const { updateState } = actions
	const { multiSelectValues, label } = useStyles().classes

	const renderResizable = (children: JSX.Element) => (
		<ResizableBox
			showHandle={isSelected}
			enable={{ bottom: true }}
			minHeight={100}
			onResize={(_event, _direction, element) => {
				updateState({ height: element.offsetHeight })
			}}
		>
			{children}
		</ResizableBox>
	)

	return (
		<>
			<InspectorControls key="setting">
				<PanelBody>
					<PanelRow>
						<TextControl
							label={__('Block Name', 'inseri-core')}
							value={metadata.name}
							onChange={(value) => {
								updateState({ metadata: { name: value } })
							}}
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={__('Support multiple files', 'inseri-core')}
							checked={multiple}
							onChange={() => {
								updateState({ multiple: !multiple })
							}}
						/>
					</PanelRow>
					<PanelRow>
						<MultiSelect
							styles={{ root: { width: '100%' } }}
							classNames={{ values: multiSelectValues, label }}
							data={COMMON_CONTENT_TYPES}
							value={accepts}
							onChange={(vals) => updateState({ accepts: vals })}
							label={__('Which file types are accepted', 'inseri-core')}
							mb="sm"
							clearable
							searchable
						/>
					</PanelRow>
					<PanelRow>
						<TextareaControl label={__('Description', 'inseri-core')} value={subText} onChange={(value) => updateState({ subText: value })} />
					</PanelRow>
					<PanelRow>
						<TextareaControl label={__('Button Text', 'inseri-core')} value={mainText} onChange={(value) => updateState({ mainText: value })} />
					</PanelRow>
				</PanelBody>
			</InspectorControls>
			<View renderResizable={renderResizable} />
		</>
	)
}

export default function Edit(props: BlockEditProps<Attributes>) {
	const { setAttributes, attributes, clientId } = props
	return (
		<SetupEditorEnv {...props} baseBlockName={'localFileImport'}>
			<InseriRoot blockId={attributes.blockId} blockName={attributes.metadata.name} blockType={config.name} clientId={clientId}>
				<StateProvider stateCreator={storeCreator} keysToSave={Object.keys(json.attributes)} setAttributes={setAttributes} initialState={attributes}>
					<EditComponent {...props} />
				</StateProvider>
			</InseriRoot>
		</SetupEditorEnv>
	)
}
