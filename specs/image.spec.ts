import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const imageSelector = '.wp-block-inseri-core-image'
const editorSelector = '.wp-block-inseri-core-text-editor'
const imageUrl = 'https://raw.githubusercontent.com/inseri-swiss/inseri-core-wp/refs/heads/main/docs/assets/inseri_logo.svg'

test.describe('Image', () => {
	test('should have title, icon, image, caption in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/image' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		let imageBlock = page.locator(imageSelector).first()
		const editorBlock = page.locator(editorSelector).first()

		expect(imageBlock.getByText('Image Box')).toBeVisible()
		expect(imageBlock.getByRole('img').first()).toHaveClass(/tabler-icon-photo/)

		await imageBlock.click()
		await page.getByLabel('height').fill('250')
		await page.getByLabel('Caption').fill('myCaption')

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'Text' }).click()
		await editorBlock.locator('textarea').first().fill(imageUrl)

		await imageBlock.getByPlaceholder('Search for blocks, content type,').click()
		await imageBlock.getByText('Text Editor').click()

		await expect(imageBlock.locator('img').first()).toBeVisible()
		await expect(imageBlock.locator('figcaption').first()).toHaveText('myCaption')

		const newPage = await editor.openPreviewPage()
		imageBlock = newPage.locator(imageSelector).first()

		await expect(imageBlock.locator('img').first()).toBeVisible()
		await expect(imageBlock.locator('figcaption').first()).toHaveText('myCaption')

		await newPage.close()
	})
})
