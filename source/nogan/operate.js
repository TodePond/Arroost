import { getCell, getWire, modifyCell, modifyWire, unfireCell } from "./nogan.js"

/** @type {OperateMap} */
export const OPERATIONS = {
	/** Modify a cell */
	modifyCell(nogan, { id, template }) {
		return modifyCell(nogan, { id, ...template })
	},

	modifyWire(nogan, { id, template }) {
		const wire = getWire(nogan, id)
		if (!wire) throw new Error(`Couldn't find wire ${id}`)
		return modifyWire(nogan, { id, ...template })
	},

	unfire(nogan, { id, colour }) {
		const cell = getCell(nogan, id)
		if (!cell) throw new Error(`Couldn't find cell ${id}`)
		return unfireCell(nogan, { id, colour })
	},

	/**
	 * Print 'pong' to the console?
	 * Just for testing purposes.
	 */
	pong() {
		// console.log("pong")
		return []
	},

	/** Tag a cell */
	tag(nogan, { id, key, value = true }) {
		const cell = getCell(nogan, id)
		if (!cell) throw new Error(`Couldn't find cell ${id} to tag`)
		const tag = {
			...cell.tag,
			[key]: value,
		}
		return modifyCell(nogan, { id, tag })
	},

	// These are just for reporting purposes
	// They've already happened!
	// So we don't need to do anything else
	fired: () => [],
	unfired: () => [],
	moved: () => [],
	binned: () => {
		throw new Error("Binned operation are never sent.... right?")
	},
}
