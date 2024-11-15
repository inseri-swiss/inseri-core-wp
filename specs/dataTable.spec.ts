import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const tableSelector = '.wp-block-inseri-core-data-table'
const editorSelector = '.wp-block-inseri-core-text-editor'

test.describe('DataTable', () => {
	test('should have title, icon, rows in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		const editorBlock = page.locator(editorSelector).first()

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'JSON', exact: true }).click()
		await editorBlock.locator('textarea').first().fill(`[ {"a": "A", "b": 28}, {"a": "B", "b": 55} ]`)

		await editor.insertBlock({ name: 'inseri-core/data-table' })
		let tableBlock = page.locator(tableSelector).first()

		await expect(tableBlock.getByText('Data Table')).toBeVisible()
		await expect(tableBlock.getByRole('img').first()).toHaveClass(/tabler-icon-table/)

		await tableBlock.getByLabel('Choose table records *').click()
		await tableBlock.getByText('Text Editor').click()
		await tableBlock.getByRole('button', { name: 'Finish' }).click()

		expect(await tableBlock.getByRole('row').count()).toBe(3) // including title bar

		const newPage = await editor.openPreviewPage()
		tableBlock = newPage.locator(tableSelector).first()

		await page.waitForTimeout(500)
		expect(await tableBlock.getByRole('row').count()).toBe(3) // including title bar
	})
})
