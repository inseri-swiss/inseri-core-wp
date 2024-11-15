import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const selector = '.wp-block-inseri-core-cytoscape'

test.describe('Cytoscape', () => {
	test('should have title, icon, graph in editor ', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/cytoscape' })

		const block = page.locator(selector).first()
		expect(block.getByText('Cytoscape')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-chart-dots-3/)

		await expect(block.getByRole('button', { name: 'Display graph' })).toBeDisabled()

		await block.getByPlaceholder('Search for blocks, content type,').click()
		await block.getByRole('option', { name: 'core - data-flow JSON' }).click()
		await block.getByRole('button', { name: 'Display graph' }).click()

		await expect(block.locator('canvas').first()).toBeVisible()
	})

	test('should have graph when published ', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/cytoscape' })

		let block = page.locator(selector).first()

		await block.getByPlaceholder('Search for blocks, content type,').click()
		await block.getByRole('option', { name: 'core - data-flow JSON' }).click()
		await block.getByRole('button', { name: 'Display graph' }).click()

		const newPage = await editor.openPreviewPage()
		block = newPage.locator(selector).first()

		await expect(block.locator('canvas').first()).toBeVisible()
		await newPage.close()
	})
})
