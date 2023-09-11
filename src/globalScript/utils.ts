import Ajv, { Schema } from 'ajv'
import addFormats from 'ajv-formats'
import produce from 'immer'
import { customAlphabet } from 'nanoid/non-secure'

//@ts-ignore
import jshashes from 'jshashes'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 21)
const generateId = (size?: number) => nanoid(size)

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

function initJsonValidator<T = any>(schema: Schema) {
	return ajv.compile<T>(schema)
}

const MD5instance = new jshashes.MD5()
const md5 = (s: string) => MD5instance.hex(s)

export { produce, initJsonValidator, generateId, md5 }
