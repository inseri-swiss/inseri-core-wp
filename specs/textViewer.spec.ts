import { test, expect } from '@wordpress/e2e-test-utils-playwright'
import { Post, getPostUrl } from './helper'

const viewerSelector = '.wp-block-inseri-core-text-viewer'
const editorSelector = '.wp-block-inseri-core-text-editor'

test.describe('TextViewer', () => {
	test('should have title and icon in editor ', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/text-viewer' })

		const block = page.locator(viewerSelector).first()
		expect(block.getByText('Text Viewer')).toBeVisible()
		expect(block.getByRole('img').first()).toHaveClass(/tabler-icon-file-typography/)
	})

	test('should have label and icon when published', async ({ page }) => {
		await page.goto(getPostUrl(Post.TextViewer_TextEditor))
		const block = page.locator(viewerSelector).first()
		expect(block.getByText('MyViewer')).toBeVisible()
		expect(block.getByRole('img').filter()).toHaveClass(/tabler-icon-eye/)
	})

	test('should receive new inputs', async ({ page }) => {
		await page.goto(getPostUrl(Post.TextViewer_TextEditor))
		const viewerBlock = page.locator(viewerSelector).first()
		const editorBlock = page.locator(editorSelector).first()

		await editorBlock.locator('textarea').first().fill('Hola Mundo!')
		await page.waitForTimeout(1000) // explicit wait needed
		expect(viewerBlock.locator('textarea').first()).toHaveText('Hola Mundo!')
	})
})
