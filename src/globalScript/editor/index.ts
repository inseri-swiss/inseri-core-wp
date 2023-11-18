import { DataFlow } from './DataFlow'
import { registerPlugin } from '@wordpress/plugins'

if ((window as any).wp?.plugins) {
	registerPlugin('inseri-core-data-flow', { render: DataFlow })
}
