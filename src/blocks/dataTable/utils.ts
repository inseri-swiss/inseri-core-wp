import { initJsonValidator } from '../../utils'

export const configSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			accessorKey: { type: 'string' },
			header: { type: 'string' },
		},
		required: ['accessorKey', 'header'],
		additionalProperties: true,
	},
}

export const isValueValid = initJsonValidator(configSchema)
