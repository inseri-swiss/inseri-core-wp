import { test, expect } from '@wordpress/e2e-test-utils-playwright'

test.describe('Editor', () => {
	test.beforeEach(async ({ admin }) => {
		await admin.createNewPost()
	})

	test('should create IIIF Viewer', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/iiif-viewer' })

		const block = page.getByLabel('Block: IIIF Viewer')
		expect(block.getByText('IIIF Viewer')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-zoom-in-area/)
	})

	test('should create Image Box', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/image' })

		const block = page.getByLabel('Block: Image Box')
		expect(block.getByText('Image Box')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-photo/)
	})

	test('should create JavaScript Code', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/javascript' })

		const block = page.getByLabel('Block: JavaScript Code')
		expect(block.getByText('JavaScript Code')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-brand-javascript/)
	})

	test('should create Local File Import', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/file-drop' })

		const block = page.getByLabel('Block: Local File Import')
		expect(block.getByText('Drag and drop here')).toBeVisible()
		expect(block.getByRole('button')).toHaveText('Select file')
	})

	test('should create Media Collection', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/media-collection' })

		const block = page.getByLabel('Block: Media Collection')
		expect(block.getByText('Media Collection')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-files/)
	})

	test('should create Plotly Chart', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/plotly' })

		const block = page.getByLabel('Block: Plotly Chart')
		expect(block.getByText('Plotly Chart')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-chart-bar/)
	})

	test('should create Python Code', async ({ editor, page }) => {
		await editor.insertBlock({ name: 'inseri-core/python' })

		const block = page.getByLabel('Block: Python Code')
		expect(block.getByText('Python Code')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-brand-python/)
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
