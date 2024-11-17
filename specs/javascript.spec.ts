import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const codeSelector = '.wp-block-inseri-core-javascript'
const editorSelector = '.wp-block-inseri-core-text-editor'
const viewerSelector = '.wp-block-inseri-core-text-viewer'
const code = 'let bar = foo.map((i)=> i.length)'

test.describe('Javascript', () => {
	test('should have title, icon, image, caption in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/javascript' })
		let codeBlock = page.locator(codeSelector).first()

		expect(codeBlock.getByText('JavaScript Code')).toBeVisible()
		expect(codeBlock.getByRole('img').first()).toHaveClass(/tabler-icon-brand-javascript/)

		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		const editorBlock = page.locator(editorSelector).first()
		let viewerBlock = page.locator(viewerSelector).first()

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'JSON', exact: true }).click()
		await editorBlock.locator('textarea').fill(`["aaaaaa", "bbb", "cccccccc"]`)

		await codeBlock.getByRole('button', { name: 'Write Code' }).click()
		await expect(codeBlock.getByRole('img').first()).toHaveClass(/tabler-icon-eye/)

		await codeBlock.locator('textarea').fill(code)
		await page.getByLabel('publicly editable').check()
		await expect(codeBlock.getByRole('img').first()).toHaveClass(/tabler-icon-pencil/)

		await page.getByLabel('Open extended view').click()
		// enter input
		await page.getByPlaceholder('Enter variable name').first().fill('foo')
		await page.getByRole('button', { name: 'Create' }).first().click()
		await page.getByPlaceholder('Choose a block source').click()
		await page.getByText('Text Editor').click()
		// enter output
		await page.getByPlaceholder('Enter variable name').nth(1).fill('bar')
		await page.getByRole('button', { name: 'Create' }).nth(1).click()
		await page.getByPlaceholder('Choose content type').click()
		await page.getByRole('option', { name: 'JSON', exact: true }).click()

		await page.locator('.inseri-mantine-Modal-header').getByRole('button').click()

		await codeBlock.getByRole('button', { name: 'Run' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('JavaScript Code').click()

		await expect(viewerBlock.locator('textarea')).toHaveText('[6,3,8]')

		const newPage = await editor.openPreviewPage()
		codeBlock = newPage.locator(codeSelector).first()
		viewerBlock = page.locator(viewerSelector).first()

		await codeBlock.getByRole('button', { name: 'Run' }).click()
		await expect(viewerBlock.locator('textarea')).toHaveText('[6,3,8]')

		await newPage.close()
	})
})
