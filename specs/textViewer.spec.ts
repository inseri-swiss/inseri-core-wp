import { test, expect } from '@wordpress/e2e-test-utils-playwright'

test.describe('Text Viewer', () => {
	test.beforeEach(async ({ admin }) => {
		await admin.createNewPost()
	})

	test('should create instance', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/text-viewer' })

		expect(page.getByLabel('Editor content').getByText('Text Viewer')).toHaveText('Text Viewer')
		expect(page.getByRole('img').nth(2)).toHaveClass(/tabler-icon-file-typography/)
	})
})
