import domReady from '@wordpress/dom-ready'
import { render } from '@wordpress/element'
import { PlotlyView } from './Component'
import { InseriThemeProvider, StateProvider } from '../../components'
import { storeCreator } from './state'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-plotly')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			render(
				<InseriThemeProvider>
					<StateProvider stateCreator={storeCreator} initialState={attributes}>
						<PlotlyView />
					</StateProvider>
				</InseriThemeProvider>,
				item
			)
		})
	}
}

domReady(initReactComponents)
