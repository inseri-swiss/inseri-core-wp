import { InseriSidebar } from './Sidebar'
import { registerPlugin } from '@wordpress/plugins'

if ((window as any).wp?.plugins) {
	registerPlugin('inseri-core-sidebar', { render: InseriSidebar })
}
