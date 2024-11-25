import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const viewerSelector = '.wp-block-inseri-core-text-viewer'
const sliderSelector = '.wp-block-inseri-core-slider'

async function moveRepeatly(page: any, key: string, count: number) {
	const moveToRight: Promise<void>[] = []
	for (let i = 0; i < count; i++) {
		moveToRight.push(page.keyboard.press(key))
	}

	return Promise.all(moveToRight)
}

test.describe('TextViewer', () => {
	test('should have slider in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/text-viewer' })
		await editor.insertBlock({ name: 'inseri-core/slider' })

		let viewerBlock = page.locator(viewerSelector).first()
		let sliderBlock = page.locator(sliderSelector).first()

		expect(sliderBlock).toBeVisible()

		await viewerBlock.getByPlaceholder('Search for blocks, content type,').click()
		await viewerBlock.getByText('Slider', { exact: true }).click()

		await expect(viewerBlock.locator('textarea')).toHaveText('50')

		await sliderBlock.getByRole('slider').focus()
		await moveRepeatly(page, 'ArrowRight', 10)
		await expect(viewerBlock.locator('textarea')).toHaveText('60')

		await sliderBlock.click()
		await page.getByText('Range', { exact: true }).click()

		await sliderBlock.getByRole('slider').first().focus()
		await moveRepeatly(page, 'ArrowLeft', 10)
		await expect(viewerBlock.locator('textarea')).toHaveText('[40,51]')

		const newPage = await editor.openPreviewPage()
		viewerBlock = newPage.locator(viewerSelector).first()
		sliderBlock = newPage.locator(sliderSelector).first()

		await sliderBlock.getByRole('slider').nth(1).focus()
		await moveRepeatly(newPage, 'ArrowRight', 5)
		await expect(viewerBlock.locator('textarea')).toHaveText('[50,56]')

		await newPage.close()
	})
})
