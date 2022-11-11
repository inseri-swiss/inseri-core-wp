import { registerBlockType } from '@wordpress/blocks'
import './style.scss'
import json from './block.json'
import edit from './edit'
import save from './save'

const { name, ...settings } = json as any

registerBlockType<any>(name, {
	...settings,
	edit,
	save,
})
