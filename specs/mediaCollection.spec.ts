import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const mediaSelector = '.wp-block-inseri-core-media-collection'
const viewerSelector = '.wp-block-inseri-core-text-viewer'

test.describe('MediaCollection', () => {
	test('should have label, button, one file in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/media-collection' })
		await editor.insertBlock({ name: 'inseri-core/text-viewer' })

		const mediaBlock = page.locator(mediaSelector).first()
		const viewerBlock = page.locator(viewerSelector).first()

		expect(mediaBlock.getByText('Media Collection')).toBeVisible()
		expect(mediaBlock.getByRole('img').first()).toHaveClass(/tabler-icon-files/)

		await page.getByRole('button', { name: 'Media Library' }).click()
		await page.getByLabel('zeus').click()
		await page.getByRole('button', { name: 'Select', exact: true }).click()

		await expect(mediaBlock.getByLabel('Choose a file')).toHaveValue('zeus', { timeout: 1000 })

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Media Collection').click()
		await expect(viewerBlock.locator('textarea')).toHaveText('Zeus is the God of the sky.', { timeout: 1000 })
	})

	test('should have multiple files in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/media-collection' })
		await editor.insertBlock({ name: 'inseri-core/text-viewer' })

		let mediaBlock = page.locator(mediaSelector).first()
		let viewerBlock = page.locator(viewerSelector).first()

		await page.getByRole('button', { name: 'Media Library' }).click()
		await page.getByLabel('zeus').click()
		await page.getByLabel('hades').click({ modifiers: ['ControlOrMeta'] })
		await page.getByRole('button', { name: 'Select', exact: true }).click()

		await mediaBlock.getByLabel('Choose a file').click()
		await mediaBlock.getByRole('option', { name: 'zeus' }).click()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Media Collection').click()
		await expect(viewerBlock.locator('textarea')).toHaveText('Zeus is the God of the sky.', { timeout: 1000 })

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')

		mediaBlock = newPage.locator(mediaSelector).first()
		viewerBlock = newPage.locator(viewerSelector).first()

		await mediaBlock.getByLabel('Choose a file').click()
		await mediaBlock.getByRole('option', { name: 'hades' }).click()
		await expect(viewerBlock.locator('textarea')).toHaveText('Hades is the God of the dead and riches.', { timeout: 1000 })

		await mediaBlock.getByLabel('Choose a file').click()
		await mediaBlock.getByRole('option', { name: 'zeus' }).click()
		await expect(viewerBlock.locator('textarea')).toHaveText('Zeus is the God of the sky.', { timeout: 1000 })

		await newPage.close()
	})
})
