import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const viewerSelector = '.wp-block-inseri-core-text-viewer'
const editorSelector = '.wp-block-inseri-core-text-editor'

test.describe('TextEditor', () => {
	test('should have title, icon, label in editor ', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		const block = page.locator(editorSelector).first()
		await expect(block.getByText('Text Editor')).toBeVisible()
		await expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-edit/)

		await block.getByLabel('Choose a format').click()
		await block.getByRole('option', { name: 'Text' }).click()

		await block.click()
		await page.getByLabel('Label').fill('MyEditor')

		await expect(block.getByText('MyEditor')).toBeVisible()
		await expect(block.getByRole('img')).toHaveClass(/tabler-icon-eye/)

		await page.getByLabel('publicly editable').check()
		await expect(block.getByRole('img')).toHaveClass(/tabler-icon-pencil/)
	})

	test('should have label, icon, text when published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		let viewerBlock = page.locator(viewerSelector).first()
		let editorBlock = page.locator(editorSelector).first()

		await editorBlock.click()
		await page.getByLabel('Label').fill('MyEditor')

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'Text' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Text Editor').click()

		await editorBlock.locator('textarea').fill('hello world')
		await page.waitForTimeout(500) // wait for auto-save

		const newPage = await editor.openPreviewPage()
		viewerBlock = newPage.locator(viewerSelector).first()
		editorBlock = newPage.locator(editorSelector).first()

		await expect(editorBlock.getByText('MyEditor')).toBeVisible()
		await expect(editorBlock.getByRole('img')).toHaveClass(/tabler-icon-eye/)

		await editorBlock.locator('textarea').fill('Hola Mundo!') // try to enter nonsense
		await expect(editorBlock.locator('textarea')).toHaveText('hello world')
		await expect(viewerBlock.locator('textarea')).toHaveText('hello world')

		await newPage.close()
	})

	test('should have edit icon and send new outputs', async ({ admin, editor, page }) => {
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

		const newPage = await editor.openPreviewPage()
		viewerBlock = newPage.locator(viewerSelector).first()
		editorBlock = newPage.locator(editorSelector).first()

		await expect(editorBlock.getByRole('img')).toHaveClass(/tabler-icon-pencil/)

		await editorBlock.locator('textarea').fill('Hola Mundo!')
		await expect(viewerBlock.locator('textarea')).toHaveText('Hola Mundo!', { timeout: 1000 })

		await newPage.close()
	})
})
