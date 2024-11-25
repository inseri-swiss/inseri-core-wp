import { test, expect } from '@wordpress/e2e-test-utils-playwright'

test.describe('Editor', () => {
	test.beforeEach(async ({ admin }) => {
		await admin.createNewPost()
	})

	test('should create Zenodo Repository', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/zenodo' })

		const block = page.getByLabel('Block: Zenodo Repository')
		expect(block.getByText('Zenodo Repository')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-books/)
	})
})
