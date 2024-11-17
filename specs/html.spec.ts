import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const htmlSelector = '.wp-block-inseri-core-html'
const editorSelector = '.wp-block-inseri-core-text-editor'

test.describe('HTML', () => {
	test('should have label, icon, content in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/html' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		let htmlBlock = page.locator(htmlSelector).first()
		let editorBlock = page.locator(editorSelector).first()

		expect(htmlBlock.getByText('HTML Code')).toBeVisible()
		expect(htmlBlock.getByRole('img').first()).toHaveClass(/tabler-icon-html/)

		await editorBlock.click()
		await page.getByLabel('publicly editable').check()

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'HTML' }).click()
		await editorBlock.locator('textarea').fill(`<h2>Hello Park</h2>`)

		await htmlBlock.getByPlaceholder('Search for blocks, content type,').click()
		await htmlBlock.getByText('Text Editor').click()

		await expect(htmlBlock.locator('h2').first()).toHaveText('Hello Park')

		const newPage = await editor.openPreviewPage()
		htmlBlock = newPage.locator(htmlSelector).first()
		editorBlock = newPage.locator(editorSelector).first()

		await editorBlock.locator('textarea').fill(`<h2>Hello Underworld</h2>`)
		await expect(htmlBlock.locator('h2').first()).toHaveText('Hello Underworld', { timeout: 1000 })

		await newPage.close()
	})
})
