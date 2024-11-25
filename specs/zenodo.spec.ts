import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const zenodoSelector = '.wp-block-inseri-core-zenodo'
const viewerSelector = '.wp-block-inseri-core-text-viewer'

test.describe('Zenodo', () => {
	test('should have title, icon, content in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/zenodo' })
		const zenodoBlock = page.locator(zenodoSelector).first()

		await expect(zenodoBlock.getByText('Zenodo Repository')).toBeVisible()
		await expect(zenodoBlock.getByRole('img').first()).toHaveClass(/tabler-icon-books/)

		await zenodoBlock.getByLabel('DOI').fill('10.5281/zenodo.7767654')
		await page.waitForTimeout(500)
		await zenodoBlock.getByRole('button', { name: 'Use selected files' }).click()

		await zenodoBlock.getByLabel('Choose a file').click()
		await zenodoBlock.getByRole('option', { name: 'streamlines_data.txt' }).click()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		let viewerBlock = page.locator(viewerSelector).first()
		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Zenodo Repository', { exact: true }).click()

		await expect(viewerBlock.locator('textarea')).toContainText(`"random_coord"`)

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')

		viewerBlock = newPage.locator(viewerSelector).first()
		await expect(viewerBlock.locator('textarea')).toContainText(`"random_coord"`)

		await newPage.close()
	})
})
