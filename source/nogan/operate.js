import { modifyNod } from "./nogan.js"

/**
 * @param {Parent} parent
 * @param {{
 * 	id: Id
 * 	data: Partial<NodTemplate>
 * }} options
 */
const modify = (parent, { id, data }) => {
	modifyNod(parent, { id, ...data })
}

/** @type {Record<OperationType, Operate>} */
export const OPERATES = {
	modify,
}
