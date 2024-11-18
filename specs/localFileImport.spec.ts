import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const dropSelector = '.wp-block-inseri-core-file-drop'
const viewerSelector = '.wp-block-inseri-core-text-viewer'

test.describe('LocalFileImport', () => {
	test('should have label, button, multiple files in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/file-drop' })
		await editor.insertBlock({ name: 'inseri-core/text-viewer' })

		let dropBlock = page.locator(dropSelector).first()
		let viewerBlock = page.locator(viewerSelector).first()

		expect(dropBlock.getByText('Drag and drop here')).toBeVisible()
		expect(dropBlock.getByRole('button')).toHaveText('Select file')

		let fileInput = await dropBlock.locator('input[type="file"]')
		await fileInput.setInputFiles('./specs/data/zeus.txt')

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Local File Import').click()
		await expect(viewerBlock.locator('textarea')).toHaveText('Zeus is the God of the sky.', { timeout: 1000 })

		await dropBlock.click()
		await page.getByLabel('Support multiple files').check()

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')

		dropBlock = newPage.locator(dropSelector).first()
		viewerBlock = newPage.locator(viewerSelector).first()

		fileInput = await dropBlock.locator('input[type="file"]')
		await fileInput.setInputFiles(['./specs/data/zeus.txt', './specs/data/hades.txt'], { timeout: 500 })

		await expect(dropBlock.getByText('Drag and drop here')).toBeVisible()
		await expect(dropBlock.getByRole('button', { name: 'Select file' })).toBeVisible()

		await dropBlock.getByRole('button', { name: 'hades.txt' }).click()
		await expect(viewerBlock.locator('textarea')).toHaveText('Hades is the God of the dead and riches.', { timeout: 1000 })

		await dropBlock.getByRole('button', { name: 'zeus.txt' }).click()
		await expect(viewerBlock.locator('textarea')).toHaveText('Zeus is the God of the sky.', { timeout: 1000 })

		await newPage.close()
	})
})
