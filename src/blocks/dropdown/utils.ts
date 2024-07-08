import { initJsonValidator } from '../../utils'

export const objectSchema = {
	type: 'array',
	items: [
		{
			properties: {
				label: { type: 'string' },
				value: {},
			},
			required: ['label', 'value'],
			additionalProperties: true,
		},
	],
}
export const stringSchema = {
	type: 'array',
	items: [{ type: 'string' }],
}

const schemaValidators = [objectSchema, stringSchema].map((s) => initJsonValidator(s))
export const isValueValid = (value: any) => schemaValidators.some((check) => check(value))
