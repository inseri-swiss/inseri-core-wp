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

		await page.getByPlaceholder('Search for blocks, content type,').click()
		await page.getByRole('option', { name: 'core - blocks JSON inseri' }).click()

		await expect(block.getByText('MyViewer')).toBeVisible()
		await expect(block.getByRole('img').filter()).toHaveClass(/tabler-icon-eye/)
		await expect(block.locator('textarea').first()).toHaveText(/"blockName"/)
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

		await editorBlock.locator('textarea').first().fill('hello world')

		await editor.publishPost()
		const newPage = await editor.openPreviewPage()

		viewerBlock = newPage.locator(viewerSelector).first()

		await expect(viewerBlock.getByText('MyViewer')).toBeVisible()
		await expect(viewerBlock.getByRole('img').filter()).toHaveClass(/tabler-icon-eye/)
		await expect(viewerBlock.locator('textarea').first()).toHaveText('hello world')

		await newPage.close()
	})

	test('should receive new inputs', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		let viewerBlock = page.locator(viewerSelector).first()
		let editorBlock = page.locator(editorSelector).first()

		await viewerBlock.click()
		await page.getByLabel('Label').fill('MyViewer')

		await editorBlock.click()
		await page.getByLabel('Label').fill('MyEditor')
		await page.getByLabel('publicly editable').check()

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'Text' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Text Editor').click()

		await editorBlock.locator('textarea').first().fill('hello world')

		await editor.publishPost()
		const newPage = await editor.openPreviewPage()

		viewerBlock = newPage.locator(viewerSelector).first()
		editorBlock = newPage.locator(editorSelector).first()

		await editorBlock.locator('textarea').first().fill('Hola Mundo!')
		await page.waitForTimeout(1000) // explicit wait needed
		await expect(viewerBlock.locator('textarea').first()).toHaveText('Hola Mundo!')

		await newPage.close()
	})
})
