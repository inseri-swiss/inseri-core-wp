import { DataFlow } from './DataFlow'
import * as lighthouse from './lighthouse'
import * as utils from './utils'
import { registerPlugin } from '@wordpress/plugins'

export { utils, lighthouse }

if ((window as any).wp?.editor) {
	registerPlugin('inseri-core-data-flow', { render: DataFlow })
}
