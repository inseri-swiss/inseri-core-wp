import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const viewerSelector = '.wp-block-inseri-core-text-viewer'
const editorSelector = '.wp-block-inseri-core-text-editor'

test.describe('TextViewer', () => {
	test('should have title, icon, label, text in editor ', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/text-viewer' })

		const block = page.locator(viewerSelector).first()
		expect(block.getByText('Text Viewer')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-file-typography/)

		await block.click()
		await page.getByLabel('Label').fill('MyViewer')

		await block.getByPlaceholder('Search for blocks, content type,').click()
		await block.getByRole('option', { name: 'core - blocks JSON inseri' }).click()

		await expect(block.getByText('MyViewer')).toBeVisible()
		await expect(block.getByRole('img')).toHaveClass(/tabler-icon-eye/)
		await expect(block.locator('textarea')).toHaveText(/"blockName"/)
	})

	test('should have label, icon, text when published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		let viewerBlock = page.locator(viewerSelector).first()
		const editorBlock = page.locator(editorSelector).first()

		await viewerBlock.click()
		await page.getByLabel('Label').fill('MyViewer')

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'Text' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Text Editor').click()

		await editorBlock.locator('textarea').fill('hello world')
		await page.waitForTimeout(500) // wait for auto-save

		const newPage = await editor.openPreviewPage()
		viewerBlock = newPage.locator(viewerSelector).first()

		await expect(viewerBlock.getByText('MyViewer')).toBeVisible()
		await expect(viewerBlock.getByRole('img')).toHaveClass(/tabler-icon-eye/)
		await expect(viewerBlock.locator('textarea')).toHaveText('hello world')

		await newPage.close()
	})

	test('should receive new inputs', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		let viewerBlock = page.locator(viewerSelector).first()
		let editorBlock = page.locator(editorSelector).first()

		await editorBlock.click()
		await page.getByLabel('publicly editable').check()

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'Text' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Text Editor').click()

		await editorBlock.locator('textarea').fill('hello world')

		const newPage = await editor.openPreviewPage()
		viewerBlock = newPage.locator(viewerSelector).first()
		editorBlock = newPage.locator(editorSelector).first()

		await editorBlock.locator('textarea').fill('Hola Mundo!')
		await expect(viewerBlock.locator('textarea')).toHaveText('Hola Mundo!', { timeout: 1000 })

		await newPage.close()
	})
})
