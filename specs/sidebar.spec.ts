import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const viewerSelector = '.wp-block-inseri-core-text-viewer'
const editorSelector = '.wp-block-inseri-core-text-editor'

test.describe('Sidebar', () => {
	test('should have block list and graph chart', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		const viewerBlock = page.locator(viewerSelector).first()
		const editorBlock = page.locator(editorSelector).first()

		await editorBlock.click()
		await page.getByLabel('Block Name').fill('MyEditor')

		await viewerBlock.click()
		await page.getByLabel('Block Name').fill('MyViewer')

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'Text' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Text Editor').click()
		await editorBlock.locator('textarea').fill('hello world')

		await page.getByLabel('inseri', { exact: true }).click()

		const blockList = await page.getByLabel('inseri Blocks').getByRole('button')
		expect(await blockList.count()).toBe(2)

		expect(blockList.first()).toContainText('MyViewer')
		expect(blockList.first()).toContainText('Text Viewer')
		await expect(blockList.first().getByRole('img')).toHaveClass(/tabler-icon-file-typography/)

		expect(blockList.nth(1)).toContainText('MyEditor')
		expect(blockList.nth(1)).toContainText('Text Editor')
		await expect(blockList.nth(1).getByRole('img')).toHaveClass(/tabler-icon-edit/)

		expect(page.locator('canvas').first()).toBeVisible()

		await page.getByLabel('maximize the chart').click()
		expect(await page.getByLabel('Data Flow', { exact: true }).locator('canvas').first()).toBeVisible()
	})
})
