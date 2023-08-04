import { modifyCell } from "./nogan.js"

/**
 * Modify a cell.
 * @type {Operate<ModifyOperation>}
 */
const modify = ({ nogan, operation }) => {
	const { id, template } = operation
	modifyCell(nogan, { id, ...template })
}

/**
 * Placeholder: Do nothing.
 * @type {Operate<Operation>}
 */
const noop = () => {}

/** @type {OperationMap} */
export const OPERATIONS = {
	modify,
	fired: noop,
	pong: noop,
}
