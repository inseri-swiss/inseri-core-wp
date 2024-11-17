import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const iiifSelector = '.wp-block-inseri-core-iiif-viewer'
const editorSelector = '.wp-block-inseri-core-text-editor'
const manifest = 'https://iiif.harvardartmuseums.org/manifests/object/299843'

test.describe('IIIF Viewer', () => {
	test('should have title, icon, canvas, label in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/iiif-viewer' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		let iiifBlock = page.locator(iiifSelector).first()
		const editorBlock = page.locator(editorSelector).first()

		expect(iiifBlock.getByText('IIIF Viewer')).toBeVisible()
		expect(iiifBlock.getByRole('img').first()).toHaveClass(/tabler-icon-zoom-in-area/)

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'Text' }).click()
		await editorBlock.locator('textarea').first().fill(manifest)

		await iiifBlock.getByPlaceholder('Search for blocks, content type,').click()
		await iiifBlock.getByText('Text Editor').click()

		await expect(iiifBlock.locator('.openseadragon-canvas').first()).toBeVisible()
		await expect(iiifBlock.locator('.clover-viewer-header .label').first()).toContainText('Paul Gauguin')

		const newPage = await editor.openPreviewPage()
		iiifBlock = newPage.locator(iiifSelector).first()

		await expect(iiifBlock.locator('.openseadragon-canvas').first()).toBeVisible()
		await expect(iiifBlock.locator('.clover-viewer-header .label').first()).toContainText('Paul Gauguin')

		await newPage.close()
	})
})
