import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const viewerSelector = '.wp-block-inseri-core-text-viewer'
const editorSelector = '.wp-block-inseri-core-text-editor'
const webApiSelector = '.wp-block-inseri-core-web-api'

const methodUrlContent = `{"method":"POST", "url":"https://raw.githubusercontent.com/inseri-swiss/inseri-core-wp/refs/heads/main/README.md"}`
const queryContent = `{"query1":"param1", "query2":"param2"}`
const headerContent = `{"headerA":"valA", "headerB":"valB"}`
const bodyContent = `my useful body`

test.describe('WebApi', () => {
	test('should have label, icon, content in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/web-api' })

		let viewerBlock = page.locator(viewerSelector).first()
		const webBlock = page.locator(webApiSelector).first()

		await expect(webBlock.getByText('Web API')).toBeVisible()
		await expect(webBlock.getByRole('img').first()).toHaveClass(/tabler-icon-api/)

		await webBlock.getByPlaceholder('URL').fill('https://raw.githubusercontent.com/inseri-swiss/inseri-core-wp/refs/heads/main/LICENSE')
		await webBlock.getByPlaceholder('In which format is the data').click()
		await webBlock.getByRole('option', { name: 'Text' }).click()
		await webBlock.getByRole('button', { name: 'Finish' }).click()
		await webBlock.getByRole('button', { name: 'Call Web API' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Web API').click()

		await expect(viewerBlock.locator('textarea')).toContainText('GNU GENERAL PUBLIC LICENSE')

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')
		viewerBlock = newPage.locator(viewerSelector).first()

		await expect(viewerBlock.locator('textarea')).toContainText('GNU GENERAL PUBLIC LICENSE', { timeout: 1000 })

		await newPage.close()
	})

	test('should override values in editor', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		await editor.insertBlock({ name: 'inseri-core/web-api' })

		const editorMethodUrl = page.locator(editorSelector).first()
		const editorQuery = page.locator(editorSelector).nth(1)
		const editorHeader = page.locator(editorSelector).nth(2)
		const editorBody = page.locator(editorSelector).nth(3)

		const webBlock = page.locator(webApiSelector).first()

		await editorMethodUrl.getByLabel('Choose a format').click()
		await editorMethodUrl.getByRole('option', { name: 'JSON', exact: true }).click()
		await editorMethodUrl.locator('textarea').fill(methodUrlContent)
		await page.getByLabel('Block Name').fill('MyMethodUrl')

		await editorQuery.getByLabel('Choose a format').click()
		await editorQuery.getByRole('option', { name: 'JSON', exact: true }).click()
		await editorQuery.locator('textarea').fill(queryContent)
		await page.getByLabel('Block Name').fill('MyQuery')

		await editorHeader.getByLabel('Choose a format').click()
		await editorHeader.getByRole('option', { name: 'JSON', exact: true }).click()
		await editorHeader.locator('textarea').fill(headerContent)
		await page.getByLabel('Block Name').fill('MyHeader')

		await editorBody.getByLabel('Choose a format').click()
		await editorBody.getByRole('option', { name: 'Text', exact: true }).click()
		await editorBody.locator('textarea').fill(bodyContent)
		await page.getByLabel('Block Name').fill('MyBody')

		await webBlock.getByPlaceholder('URL').fill('https://raw.githubusercontent.com/inseri-swiss/inseri-core-wp/refs/heads/main/LICENSE')
		await webBlock.getByPlaceholder('In which format is the data').click()
		await webBlock.getByRole('option', { name: 'Text' }).click()
		await webBlock.getByRole('button', { name: 'Finish' }).click()

		await page.getByLabel('Configure the settings').click()

		await expect(page.getByPlaceholder('Enter your URL')).toHaveValue('https://raw.githubusercontent.com/inseri-swiss/inseri-core-wp/refs/heads/main/LICENSE')
		await expect(page.getByLabel('HTTP Method')).toHaveValue('GET')

		await page.getByLabel('Override method and URL').click()
		await page.getByText('MyMethodUrl - content').click()

		await expect(page.getByPlaceholder('Enter your URL')).toHaveValue('https://raw.githubusercontent.com/inseri-swiss/inseri-core-wp/refs/heads/main/README.md')
		await expect(page.getByLabel('HTTP Method')).toHaveValue('POST')

		await page.getByLabel('Extend query params').click()
		await page.getByText('MyQuery - content').click()

		await expect(page.getByRole('row', { name: 'query1 param1' })).toBeVisible()
		await expect(page.getByRole('row', { name: 'query2 param2' })).toBeVisible()

		await page.getByRole('tab', { name: 'Headers' }).click()
		await page.getByLabel('Extend headers').click()
		await page.getByText('MyHeader - content').click()

		await expect(page.getByRole('row', { name: 'headerA valA' })).toBeVisible()
		await expect(page.getByRole('row', { name: 'headerB valB' })).toBeVisible()

		await page.getByRole('tab', { name: 'Body' }).click()
		await page.getByLabel('Override body').click()
		await page.getByText('MyBody - content').click()

		await expect(page.getByLabel('Parameters').getByRole('textbox')).toHaveText(`my useful body`)
	})
})
