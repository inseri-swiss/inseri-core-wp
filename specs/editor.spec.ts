import { test, expect } from '@wordpress/e2e-test-utils-playwright'

test.describe('Editor', () => {
	test.beforeEach(async ({ admin }) => {
		await admin.createNewPost()
	})

	test('should create R Code', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/r-code' })

		expect(page.getByLabel('Block: R Code').getByText('R Code')).toBeVisible()
	})

	test('should create Share', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/share' })

		const block = page.getByLabel('Block: Share')
		expect(block).toHaveText('Share')
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-share/)
	})

	test('should create Slider', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/slider' })

		expect(page.getByLabel('Block: Slider')).toBeVisible()
	})

	test('should create Web Api', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/web-api' })

		const block = page.getByLabel('Block: Web API')
		expect(block.getByText('Web API')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-api/)
	})

	test('should create Zenodo Repository', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/zenodo' })

		const block = page.getByLabel('Block: Zenodo Repository')
		expect(block.getByText('Zenodo Repository')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-books/)
	})
})
