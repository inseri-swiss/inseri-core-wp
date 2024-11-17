import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const dropdownSelector = '.wp-block-inseri-core-dropdown'
const editorSelector = '.wp-block-inseri-core-text-editor'
const viewerSelector = '.wp-block-inseri-core-text-viewer'

test.describe('Dropdown', () => {
	test('should have title, icon, options in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/text-editor' })
		const editorBlock = page.locator(editorSelector).first()

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'JSON', exact: true }).click()
		await editorBlock.locator('textarea').fill(`[ "one", "two", "three" ]`)

		await editor.insertBlock({ name: 'inseri-core/dropdown' })
		let dropdown = page.locator(dropdownSelector).first()

		await expect(dropdown.getByText('Dropdown')).toBeVisible()
		await expect(dropdown.getByRole('img').first()).toHaveClass(/tabler-icon-caret-down/)

		await dropdown.getByPlaceholder('Search for blocks, content type,').click()
		await dropdown.getByText('Text Editor').click()

		await expect(dropdown.getByText('Choose an item')).toBeVisible()

		await dropdown.getByLabel('Choose an item').click()
		await expect(await dropdown.getByRole('option').count()).toEqual(3)
		await dropdown.getByRole('option', { name: 'three' }).click()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		let viewerBlock = page.locator(viewerSelector).first()
		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Dropdown', { exact: true }).click()

		await expect(viewerBlock.locator('textarea')).toHaveText(`"three"`)

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')

		dropdown = newPage.locator(dropdownSelector).first()
		viewerBlock = newPage.locator(viewerSelector).first()

		await dropdown.getByLabel('Choose an item').click()
		await dropdown.getByRole('option', { name: 'one' }).click()
		await expect(viewerBlock.locator('textarea')).toHaveText(`"one"`)

		await newPage.close()
	})
})
