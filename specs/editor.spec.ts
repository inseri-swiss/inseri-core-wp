import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const viewerSelector = '.wp-block-inseri-core-text-viewer'
const editorSelector = '.wp-block-inseri-core-text-editor'

test.describe('Editor', () => {
	test('should copy blocks linked together', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		await editor.insertBlock({ name: 'core/paragraph' })

		const firstViewer = page.locator(viewerSelector).first()
		const firstEditor = page.locator(editorSelector).first()

		await firstEditor.getByLabel('Choose a format').click()
		await firstEditor.getByRole('option', { name: 'Text' }).click()

		await firstViewer.getByPlaceholder('Search for blocks, content type,').click()
		await firstViewer.getByText('Text Editor').click()

		await firstViewer.click()
		await firstEditor.click({ modifiers: ['Shift'] })

		await firstEditor.press('Control+C')
		await page.getByLabel('Empty block; start writing or').press('Control+V')

		const secondViewer = page.locator(viewerSelector).nth(1)
		const secondEditor = page.locator(editorSelector).nth(1)

		await firstEditor.locator('textarea').fill('hello original world')
		await secondEditor.locator('textarea').fill('hola alternative world')

		await expect(firstViewer.locator('textarea')).toHaveText('hello original world')
		await expect(secondViewer.locator('textarea')).toHaveText('hola alternative world')
	})

	test('should duplicate blocks linked together', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		const firstViewer = page.locator(viewerSelector).first()
		const firstEditor = page.locator(editorSelector).first()

		await firstEditor.getByLabel('Choose a format').click()
		await firstEditor.getByRole('option', { name: 'Text' }).click()

		await firstViewer.getByPlaceholder('Search for blocks, content type,').click()
		await firstViewer.getByText('Text Editor').click()

		await firstViewer.click()
		await firstEditor.click({ modifiers: ['Shift'] })

		await page.getByLabel('Block tools').getByLabel('Options').click()
		await page.getByRole('menuitem', { name: 'Duplicate' }).click()

		const secondViewer = page.locator(viewerSelector).nth(1)
		const secondEditor = page.locator(editorSelector).nth(1)

		await firstEditor.locator('textarea').fill('hello original world')
		await secondEditor.locator('textarea').fill('hola alternative world')

		await expect(firstViewer.locator('textarea')).toHaveText('hello original world')
		await expect(secondViewer.locator('textarea')).toHaveText('hola alternative world')
	})
})
