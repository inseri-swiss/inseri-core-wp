import { test, expect } from '@wordpress/e2e-test-utils-playwright'
import type { Locator, Page } from 'playwright-core'

const selector = '.wp-block-inseri-core-download'

async function assertDownload(page: Page, block: Locator) {
	const button = await block.getByRole('link')
	expect(button).toHaveText('Download')

	const downloadPromise = page.waitForEvent('download')
	await button.click()
	const download = await downloadPromise

	expect(download.suggestedFilename()).toEqual('file.json')

	const stream = await download.createReadStream()
	const fileContent = await new Response(stream as any).text()
	expect(fileContent).toContain(`"blockType":"inseri-core/download"`)
}

test.describe('Download', () => {
	test('should have title, icon, label, fileContent in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/download' })
		let block = page.locator(selector).first()

		await expect(block.getByText('Download', { exact: true })).toBeVisible()
		await expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-file-download/)

		await block.getByPlaceholder('Search for blocks, content type,').click()
		await block.getByRole('option', { name: 'core - blocks JSON inseri' }).click()

		await assertDownload(page, block)

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')

		block = newPage.locator(selector).first()
		await assertDownload(newPage, block)
		await newPage.close()
	})
})
