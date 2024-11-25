import { test, expect } from '@wordpress/e2e-test-utils-playwright'

const plotlySelector = '.wp-block-inseri-core-plotly'
const editorSelector = '.wp-block-inseri-core-text-editor'

const data = `
{
    "data": [
        {   "x": [ "giraffes", "orangutans", "monkeys" ],
            "y": [ 20, 14, 23 ],
            "type": "bar"
		}
    ]
}
`

test.describe('Plotly', () => {
	test('should have label, icon, chart in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()

		await editor.insertBlock({ name: 'inseri-core/plotly' })
		await editor.insertBlock({ name: 'inseri-core/text-editor' })

		let chartBlock = page.locator(plotlySelector).first()
		const editorBlock = page.locator(editorSelector).first()

		expect(chartBlock.getByText('Plotly Chart')).toBeVisible()
		expect(chartBlock.getByRole('img').first()).toHaveClass(/tabler-icon-chart-bar/)

		await editorBlock.click()
		await page.getByLabel('publicly editable').check()

		await editorBlock.getByLabel('Choose a format').click()
		await editorBlock.getByRole('option', { name: 'JSON', exact: true }).click()
		await editorBlock.locator('textarea').fill(data)

		await chartBlock.getByPlaceholder('Search for blocks, content type,').click()
		await chartBlock.getByText('Text Editor').click()
		await chartBlock.getByRole('button', { name: 'Display chart' }).click()

		await expect(chartBlock).toContainText('giraffes', { timeout: 1000 })
		await expect(chartBlock).toContainText('orangutans', { timeout: 1000 })
		await expect(chartBlock).toContainText('monkeys', { timeout: 1000 })

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')
		chartBlock = newPage.locator(plotlySelector).first()

		await expect(chartBlock).toContainText('giraffes', { timeout: 1000 })
		await expect(chartBlock).toContainText('orangutans', { timeout: 1000 })
		await expect(chartBlock).toContainText('monkeys', { timeout: 1000 })

		await newPage.close()
	})
})
