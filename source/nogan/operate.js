import { modifyNod } from "./nogan.js"

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id
 * 	data: any
 * }} options
 */
const modify = (parent, { id, data }) => {
	modifyNod(parent, { id, ...data })
}

export const OPERATES = {
	modify,
}
