import domReady from '@wordpress/dom-ready'
import { render } from '@wordpress/element'
import { Global, InseriThemeProvider, StateProvider, datasourceStoreCreator, datasourceInitialState } from '../components'
import { AdminPanel } from './AdminPanel'
import './editor.scss'

const AdminGlobalStyles = () => (
	<Global
		styles={(_theme) => ({
			body: { backgroundColor: '#f0f0f1' },

			'#wpcontent': {
				paddingLeft: '0',
			},

			'@media screen and (max-width: 782px)': {
				'.auto-fold #wpcontent': {
					paddingLeft: '0',
				},
			},
		})}
	/>
)

function Root() {
	return (
		<InseriThemeProvider>
			<AdminGlobalStyles />
			<StateProvider stateCreator={datasourceStoreCreator} initialState={datasourceInitialState}>
				<AdminPanel />
			</StateProvider>
		</InseriThemeProvider>
	)
}

function init() {
	const root = document.querySelector('#inseri-core-root')
	render(<Root />, root)
}

domReady(init)
