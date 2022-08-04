import { registerBlockType } from '@wordpress/blocks'
import './style.scss'
import json from './block.json'
import edit from './edit'
import save from './save'
import type { BlockIcon } from 'wordpress__blocks'

const { name, icon, ...settings } = json

registerBlockType<any>(name, {
	...settings,
	icon: icon as BlockIcon,
	edit,
	save,
})
