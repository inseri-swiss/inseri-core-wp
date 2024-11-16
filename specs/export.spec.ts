import { expect, test } from '@wordpress/e2e-test-utils-playwright'
import { execSync } from 'child_process'
import fs from 'fs'

const selector = '.wp-block-inseri-core-export'
const downloadPath = './artifacts/archive.zip'
const folderPath = './artifacts/archive/'

test.describe('Export', () => {
	test('should have title, icon, label and contain all 3 files in editor/published', async ({ admin, editor, page }) => {
		await admin.createNewPost()
		await editor.insertBlock({ name: 'inseri-core/export' })
		let block = page.locator(selector).first()

		const button = await block.getByRole('link')
		expect(button).toHaveText('Export')

		const newPage = await editor.openPreviewPage()
		await newPage.waitForEvent('load')

		block = newPage.locator(selector).first()

		const downloadPromise = page.waitForEvent('download')
		await button.click()
		const download = await downloadPromise

		expect(download.suggestedFilename()).toEqual('archive.zip')

		await download.saveAs(downloadPath)

		execSync(`unzip ${downloadPath} -d ${folderPath}`, { encoding: 'utf8' })

		const files = fs.readdirSync(folderPath)
		expect(files).toEqual(expect.arrayContaining(['blueprint.json', 'post.xml', 'readme.md']))

		const sizes = files.map((f) => fs.statSync(folderPath + f).size)
		sizes.forEach((s) => {
			expect(s).toBeGreaterThan(0)
		})

		fs.rmSync(downloadPath, { force: true })
		fs.rmSync(folderPath, { force: true, recursive: true })

		await newPage.close()
	})
})
