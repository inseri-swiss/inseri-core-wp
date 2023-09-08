import { InseriRoot } from '@inseri/lighthouse'
import domReady from '@wordpress/dom-ready'
import { createRoot } from '@wordpress/element'
import { RecoilRoot } from 'recoil'
import { InseriThemeProvider } from '../../components'
import config from './block.json'
import View from './view'

function initReactComponents() {
	const items = document.querySelectorAll('.wp-block-inseri-core-download')
	if (items) {
		Array.from(items).forEach((item: any) => {
			const attributes = JSON.parse(item.dataset.attributes)
			createRoot(item!).render(
				<InseriThemeProvider>
					<RecoilRoot>
						<InseriRoot blockId={attributes.blockId} blockName={attributes.blockName} blockType={config.name}>
							<View attributes={attributes} />
						</InseriRoot>
					</RecoilRoot>
				</InseriThemeProvider>
			)
		})
	}
}

domReady(initReactComponents)
