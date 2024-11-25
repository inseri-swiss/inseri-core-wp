import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const shareSelector = '.wp-block-inseri-core-share'
const viewerSelector = '.wp-block-inseri-core-text-viewer'
const editorSelector = '.wp-block-inseri-core-text-editor'

test.describe('Share', () => {
	test('should have label, icon, url in editor/published', async ({ admin, editor, page, context, browser }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write'])
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		await editor.insertBlock({ name: 'inseri-core/share' })

		let shareBlock = page.locator(shareSelector).first()
		let viewerBlock = page.locator(viewerSelector).first()
		const editorBlock = page.locator(editorSelector).first()

		await expect(shareBlock).toHaveText('Share')
		await expect(shareBlock.getByRole('img')).toHaveClass(/tabler-icon-share/)

		await editorBlock.click()
		await page.getByLabel('publicly editable').check()
		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'Text' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Text Editor').click()

		await editorBlock.locator('textarea').fill('hello world')
		await page.waitForTimeout(500)

		await shareBlock.getByRole('button').click()
		let clipboardContent = await page.evaluate(() => navigator.clipboard.readText())
		expect(clipboardContent).toMatch(/http:\/\/localhost:8889\/\?p=(\d+)#{"(.+)":{"code":"hello world"}}/)

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')
		viewerBlock = newPage.locator(viewerSelector).first()
		shareBlock = newPage.locator(shareSelector).first()

		await shareBlock.getByRole('button').click()
		clipboardContent = await newPage.evaluate(() => navigator.clipboard.readText())
		expect(clipboardContent).toMatch(/http:\/\/localhost:8889\/\?p=(\d+)&preview=true#{"(.+)":{"code":"hello world"}}/)

		const newUrl = clipboardContent.replace('hello world', 'hola mundo')
		await newPage.goto(newUrl)
		await expect(viewerBlock.locator('textarea')).toHaveText('hola mundo', { timeout: 1000 })

		await newPage.close()

		const thirdPage = await browser.newPage()
		await thirdPage.goto(newUrl)

		viewerBlock = thirdPage.locator(viewerSelector).first()
		await expect(viewerBlock.locator('textarea')).toHaveText('hola mundo', { timeout: 1000 })

		await thirdPage.close()
	})
})
