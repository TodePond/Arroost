import { modifyCell } from "./nogan.js"

/**
 * Modify a cell.
 * @type {Operate<ModifyOperation>}
 */
const modify = (nogan, { id, template }) => {
	return modifyCell(nogan, { id, ...template })
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

/** @type {OperationMap} */
export const OPERATIONS = {
	modify,
	fired: noop,
	pong,
}
