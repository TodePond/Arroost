import { getCell, modifyCell } from "./nogan.js"

/**
 * Modify a cell.
 * @type {Operate<ModifyOperation>}
 */
const modify = (nogan, { id, position, template }) => {
	return modifyCell(nogan, { id, position, ...template })
}

/**
 * Placeholder: Do nothing.
 * @type {Operate<Operation>}
 */
const noop = () => []

/**
 * Print 'pong' to the console?
 * Just for testing purposes.
 * @type {Operate<PongOperation>}
 */
const pong = () => {
	// console.log("pong")
	return []
}

/**
 * Tag a cell.
 * @type {Operate<TagOperation>}
 */
const tag = (nogan, { id, key, value = true }) => {
	const cell = getCell(nogan, id)
	const tag = {
		...cell.tag,
		[key]: value,
	}
	return modifyCell(nogan, { id, tag })
}

/** @type {OperationMap} */
export const OPERATIONS = {
	modify,
	fired: noop,
	unfired: noop,
	pong,
	tag,
	binned: noop,
	modified: noop,
}
