import Ajv, { Schema } from 'ajv'
import produce from 'immer'
import { nanoid } from 'nanoid/non-secure'

const generateId = (size?: number) => nanoid(size)

const ajv = new Ajv({ allErrors: true })

function initJsonValidator<T = any>(schema: Schema) {
	return ajv.compile<T>(schema)
}

export { produce, initJsonValidator, generateId }
