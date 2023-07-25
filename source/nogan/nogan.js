import { Schema } from "../../libraries/schema.js"
import { NoganSchema } from "./schema.js"

const N = NoganSchema
const S = Schema

//============//
// Validating //
//============//
/** @type {boolean | null} */
let _shouldValidate = null

/**
 * Should we validate?
 * @returns {boolean}
 */
export const shouldValidate = () => {
	if (_shouldValidate !== null) return _shouldValidate
	_shouldValidate = !!(!window.shared || window.shared.debug.validate)
	return _shouldValidate
}

/**
 * Validate a value against a schema.
 * Only runs if we're in debug mode.
 * @param {any} value
 * @param {Schema} schema
 */
export const validate = (value, schema) => {
	if (!shouldValidate()) return

	try {
		schema.validate(value)
	} catch (error) {
		// console.log(value)
		// console.error(schema.diagnose(value))
		throw error
	}
}

//=======//
// Nogan //
//=======//
/**
 * Create a nogan.
 * @returns {Nogan}
 */
export const createNogan = () => {
	const nogan = N.Nogan.make()
	validate(nogan, N.Nogan)
	return nogan
}

/**
 * Get the root cell.
 * @param {Nogan} nogan
 * @returns {Cell}
 */
export const getRoot = (nogan) => {
	const root = nogan.items[0]
	validate(root, N.Cell)
	// @ts-expect-error
	return root
}

//====//
// Id //
//====//
/**
 * Reserve a cell id.
 * @param {Nogan} nogan
 * @returns {CellId}
 */
export const reserveCellId = (nogan) => {
	if (nogan.deletedCells.length > 0) {
		const id = nogan.deletedCells.pop()
		validate(nogan, N.Nogan)
		validate(id, N.CellId)
		// @ts-expect-error
		return id
	}

	const id = nogan.nextCell
	nogan.nextCell++
	nogan.items[id] = null
	validate(nogan, N.Nogan)
	validate(id, N.CellId)
	return id
}

/**
 * Reserve a wire id.
 * @param {Nogan} nogan
 * @returns {WireId}
 */
export const reserveWireId = (nogan) => {
	if (nogan.deletedWires.length > 0) {
		const id = nogan.deletedWires.pop()
		validate(nogan, N.Nogan)
		validate(id, N.WireId)
		// @ts-expect-error
		return id
	}

	const id = nogan.nextWire
	nogan.nextWire--
	nogan.items[id] = null
	validate(nogan, N.Nogan)
	validate(id, N.WireId)
	return id
}

/**
 * Bin a cell id.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * 	mode?: "delete" | "archive",
 * 	check?: boolean,
 * }} options
 */
export const binCellId = (nogan, { id, mode = "delete", check = true }) => {
	const bin = mode === "delete" ? nogan.deletedCells : nogan.archivedCells
	bin.push(id)
	nogan.items[id] = null
	if (check) validate(nogan, N.Nogan)
}

/**
 * Delete a cell id.
 * @param {Nogan} nogan
 * @param {CellId} id
 * @param {{check?: boolean}} options
 */
export const deleteCellId = (nogan, id, { check = true } = {}) => {
	return binCellId(nogan, { id, mode: "delete", check })
}

/**
 * Archive a cell id.
 * @param {Nogan} nogan
 * @param {CellId} id
 * @param {{check?: boolean}} options
 */
export const archiveCellId = (nogan, id, { check = true } = {}) => {
	return binCellId(nogan, { id, mode: "archive", check })
}

/**
 * Bin a wire id.
 * @param {Nogan} nogan
 * @param {{
 * 	id: WireId,
 * 	mode?: "delete" | "archive",
 * 	check?: boolean,
 * }} options
 */
export const binWireId = (nogan, { id, mode = "delete", check = true }) => {
	const bin = mode === "delete" ? nogan.deletedWires : nogan.archivedWires
	bin.push(id)
	nogan.items[id] = null
	if (check) validate(nogan, N.Nogan)
}

/**
 * Delete a wire id.
 * @param {Nogan} nogan
 * @param {WireId} id
 */
export const deleteWireId = (nogan, id) => {
	return binWireId(nogan, { id, mode: "delete" })
}

/**
 * Archive a wire id.
 * @param {Nogan} nogan
 * @param {WireId} id
 */
export const archiveWireId = (nogan, id) => {
	return binWireId(nogan, { id, mode: "archive" })
}

/**
 * Delete archived cell id.
 * @param {Nogan} nogan
 * @param {CellId} id
 */
export const deleteArchivedCellId = (nogan, id) => {
	const index = nogan.archivedCells.indexOf(id)
	nogan.archivedCells.splice(index, 1)
	nogan.deletedCells.push(id)
	validate(nogan, N.Nogan)
}

/**
 * Delete archived wire id.
 * @param {Nogan} nogan
 * @param {WireId} id
 */
export const deleteArchivedWireId = (nogan, id) => {
	const index = nogan.archivedWires.indexOf(id)
	nogan.archivedWires.splice(index, 1)
	nogan.deletedWires.push(id)
	validate(nogan, N.Nogan)
}

/**
 * Delete cell id archive.
 * @param {Nogan} nogan
 */
export const deleteArchivedCellIds = (nogan) => {
	nogan.deletedCells.push(...nogan.archivedCells)
	nogan.archivedCells = []
	validate(nogan, N.Nogan)
}

/**
 * Delete wire id archive.
 * @param {Nogan} nogan
 */
export const deleteArchivedWireIds = (nogan) => {
	nogan.deletedWires.push(...nogan.archivedWires)
	nogan.archivedWires = []
	validate(nogan, N.Nogan)
}

//======//
// Cell //
//======//
/**
 * Create a cell.
 * @param {Nogan} nogan
 * @param {{
 * 	parent?: CellId,
 * 	type?: CellType,
 * 	position?: Vector2D
 * }} options
 * @returns {Cell}
 */
export const createCell = (nogan, { parent = 0, type = "dummy", position = [0, 0] } = {}) => {
	const id = reserveCellId(nogan)
	const cell = N.Cell.make({ id, type, position, parent })
	nogan.items[id] = cell

	const parentCell = getCell(nogan, parent)
	parentCell.cells.push(id)

	validate(cell, N.Cell)
	validate(parentCell, N.Cell)
	validate(nogan, N.Nogan)
	return cell
}

/**
 * Get a cell.
 * @param {Nogan} nogan
 * @param {CellId} id
 * @param {{check?: boolean}} options
 * @returns {Cell}
 */
export const getCell = (nogan, id, { check = true } = {}) => {
	const cell = nogan.items[id]
	if (check) validate(cell, N.Cell)
	// @ts-expect-error
	return cell
}

/**
 * Iterate through all cells.
 * @param {Nogan} nogan
 * @return {Iterable<Cell>}
 */
export function* iterateCells(nogan) {
	for (let id = 0; id < nogan.nextCell; id++) {
		const cell = nogan.items[id]
		if (!cell) continue
		validate(cell, N.Cell)
		// @ts-expect-error
		yield cell
	}
}

/**
 * Get all cells.
 * @param {Nogan} nogan
 * @returns {Cell[]}
 */
export const getCells = (nogan) => {
	return [...iterateCells(nogan)]
}

/**
 * Give a child to another cell.
 * @param {Nogan} nogan
 * @param {{
 * 	source?: CellId,
 * 	target: CellId,
 * 	child: CellId,
 * }} options
 */
export const giveChild = (nogan, { source = 0, target, child }) => {
	const sourceCell = getCell(nogan, source)
	const targetCell = getCell(nogan, target)
	const childCell = getCell(nogan, child)

	const sourceIndex = sourceCell.cells.indexOf(child)
	sourceCell.cells.splice(sourceIndex, 1)

	childCell.parent = target
	targetCell.cells.push(child)

	validate(sourceCell, N.Cell)
	validate(targetCell, N.Cell)
	validate(childCell, N.Cell)
	validate(nogan, N.Nogan)
}

/**
 * Create a template from a cell.
 * @param {Partial<Cell>} cell
 * @returns {CellTemplate}
 */
export const createTemplate = ({ type = "dummy", position = [0, 0] } = {}) => {
	const template = N.CellTemplate.make({ type, position })
	validate(template, N.CellTemplate)
	return template
}

/**
 * Bin a cell.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * 	mode?: "delete" | "archive",
 * 	check?: boolean,
 * }} options
 */
export const binCell = (nogan, { id, mode = "delete", check = true }) => {
	const cell = getCell(nogan, id, { check })
	const parentCell = getCell(nogan, cell.parent, { check })
	if (parentCell) {
		const index = parentCell.cells.indexOf(id)
		parentCell.cells.splice(index, 1)
	}

	binCellId(nogan, { mode, id: cell.id, check: false })

	for (const child of cell.cells) {
		binCell(nogan, { id: child, mode, check: false })
	}

	for (const input of cell.inputs) {
		binWire(nogan, { id: input, mode, check: false })
	}

	for (const output of cell.outputs) {
		binWire(nogan, { id: output, mode, check: false })
	}

	if (check) {
		validate(parentCell, N.Cell)
		validate(nogan, N.Nogan)
	}
}

/**
 * Delete a cell.
 * @param {Nogan} nogan
 * @param {CellId} id
 */
export const deleteCell = (nogan, id) => {
	return binCell(nogan, { id, mode: "delete" })
}

/**
 * Archive a cell.
 * @param {Nogan} nogan
 * @param {CellId} id
 */
export const archiveCell = (nogan, id) => {
	return binCell(nogan, { id, mode: "archive" })
}

//======//
// Wire //
//======//
/**
 * Create a wire.
 * @param {Nogan} nogan
 * @param {{
 * 	source: CellId,
 * 	target: CellId,
 * 	colour?: WireColour,
 * 	timing?: Timing,
 * }} options
 * @returns {Wire}
 */
export const createWire = (nogan, { source, target, colour = "any", timing = 0 }) => {
	const id = reserveWireId(nogan)
	const wire = N.Wire.make({ id, source, target, colour, timing })
	nogan.items[id] = wire

	const sourceCell = getCell(nogan, source)
	const targetCell = getCell(nogan, target)
	sourceCell.outputs.push(id)
	targetCell.inputs.push(id)

	validate(wire, N.Wire)
	validate(sourceCell, N.Cell)
	validate(targetCell, N.Cell)
	validate(nogan, N.Nogan)
	return wire
}

/**
 * Get a wire.
 * @param {Nogan} nogan
 * @param {WireId} id
 * @param {{check?: boolean}} options
 * @returns {Wire}
 */
export const getWire = (nogan, id, { check = true } = {}) => {
	const wire = nogan.items[id]
	validate(wire, N.Wire)
	// @ts-expect-error
	return wire
}

/**
 * Delete a wire.
 * @param {Nogan} nogan
 * @param {WireId} id
 */
export const deleteWire = (nogan, id) => {
	binWire(nogan, { id, mode: "delete" })
}

/**
 * Archive a wire.
 * @param {Nogan} nogan
 * @param {WireId} id
 */
export const archiveWire = (nogan, id) => {
	binWire(nogan, { id, mode: "archive" })
}

/**
 * Bin a wire.
 * @param {Nogan} nogan
 * @param {{
 * 	id: WireId,
 * 	mode?: "delete" | "archive",
 * 	check?: boolean,
 * }} options
 */
export const binWire = (nogan, { id, mode = "delete", check = true }) => {
	const wire = getWire(nogan, id, { check })

	const sourceCell = getCell(nogan, wire.source, { check })
	if (sourceCell) {
		const sourceIndex = sourceCell.outputs.indexOf(id)
		sourceCell.outputs.splice(sourceIndex, 1)
	}

	const targetCell = getCell(nogan, wire.target, { check })
	if (targetCell) {
		const targetIndex = targetCell.inputs.indexOf(id)
		targetCell.inputs.splice(targetIndex, 1)
	}

	binWireId(nogan, { mode, id: wire.id, check: false })

	if (check) {
		validate(sourceCell, N.Cell)
		validate(targetCell, N.Cell)
		validate(nogan, N.Nogan)
	}
}

/**
 * Iterate through all wires.
 * @param {Nogan} nogan
 * @return {Iterable<Wire>}
 */
export function* iterateWires(nogan) {
	for (let id = -1; id >= nogan.nextWire; id--) {
		const wire = nogan.items[id]
		if (!wire) continue
		validate(wire, N.Wire)
		// @ts-expect-error
		yield wire
	}
}

/**
 * Get all wires.
 * @param {Nogan} nogan
 * @returns {Wire[]}
 */
export const getWires = (nogan) => {
	return [...iterateWires(nogan)]
}

//======//
// Peak //
//======//
/**
 * Create a peak.
 * This is just a helper function to make your code shorter.
 * @param {{
 * 	result?: boolean,
 * 	operations?: Operation[],
 * 	pulse?: Pulse,
 * }} options
 * @returns {Peak}
 */
export const createPeak = ({ result = false, operations = [], pulse } = {}) => {
	const peak = result
		? N.SuccessPeak.make({ result, operations, pulse })
		: N.FailPeak.make({ operations })
	validate(peak, N.Peak)
	return peak
}

//=======//
// Pulse //
//=======//
/**
 * Fire a cell.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * 	colour?: PulseColour,
 * 	type?: PulseType,
 * }} options
 */
export const fireCell = (nogan, { id, colour = "blue", type = "any" }) => {
	const cell = getCell(nogan, id)
	const { fire } = cell
	const pulse = fire[colour]

	// const peak = behave(nogan, { peak: createPeak({ type }), id })
}

// //=========//
// // Pulsing //
// //=========//
// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour?: PulseColour,
//  * 	type?: PulseType,
//  * }} options
//  * @returns
//  */
// export const addPulse = (parent, { id, colour = "blue", type = "any" }) => {
// 	const nod = getNod(parent, id)
// 	const { pulses } = nod
// 	const pulse = pulses[colour]

// 	const phantomPeak = N.SuccessPeak.make({
// 		result: true,
// 		type,
// 		template: {},
// 	})

// 	const transformedPeak = behave(parent, { peak: phantomPeak, id })
// 	if (!transformedPeak.result) {
// 		return
// 	}

// 	// Don't do anything if we're already pulsing
// 	if (pulse?.type === transformedPeak.type) {
// 		return
// 	}

// 	// Update our pulse
// 	pulses[colour] = N.Pulse.make({ type: transformedPeak.type })

// 	// These operations could be collated together for a perf boost
// 	// --- Apply any operations ---
// 	propogate(parent)
// 	// --- End of operations ---

// 	validate(nod)
// 	validate(parent)
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * }} options
//  */
// export const addFullPulse = (parent, { id }) => {
// 	for (const colour of PULSE_COLOURS) {
// 		addPulse(parent, { id, colour })
// 	}
// }

// //===========//
// // Modifying //
// //===========//
// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	type?: NodType,
//  * 	position?: Vector2D,
//  * }} options
//  */
// export const modifyNod = (parent, { id, type, position }) => {
// 	const nod = getNod(parent, id)
// 	nod.type = type ?? nod.type
// 	nod.position = position ?? nod.position

// 	validate(parent)
// 	validate(nod)
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour?: WireColour,
//  * 	timing?: Timing,
//  * }} options
//  */
// export const modifyWire = (parent, { id, colour, timing }) => {
// 	const wire = getWire(parent, id)
// 	wire.colour = colour ?? wire.colour
// 	wire.timing = timing ?? wire.timing

// 	validate(parent)
// 	validate(wire)
// }

// //=========//
// // Peaking //
// //=========//
// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour?: PulseColour,
//  * 	timing?: Timing,
//  * 	history?: Parent[],
//  * 	future?: Parent[],
//  * }} options
//  * @returns {Peak}
//  */
// export const getPeak = (
// 	parent,
// 	{ id, colour = "blue", timing = 0, history = [], future = [] },
// ) => {
// 	const peak = _getPeak(parent, { id, colour, timing, history, future })
// 	validate(peak)
// 	validate(parent)
// 	return peak
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour?: PulseColour,
//  * 	timing?: Timing,
//  * 	history?: Parent[],
//  * 	future?: Parent[],
//  * }} options
//  * @returns {Peak}
//  */
// const _getPeak = (parent, { id, colour, timing, history, future }) => {
// 	switch (timing) {
// 		case 0:
// 			return getPeakNow(parent, { id, colour, history, future })
// 		case -1:
// 			return getPeakBefore(parent, { id, colour, history, future })
// 		case 1:
// 			return getPeakAfter(parent, { id, colour, history, future })
// 	}

// 	return N.Never.make({ id, colour, timing, history })
// }

// /**
//  *
//  * @param {{
//  * 	result?: boolean,
//  * 	type?: PulseType,
//  * 	template?: NodTemplate,
//  * 	operations?: Operation[],
//  * }?} options
//  * @returns {Peak}
//  */
// export const createPeak = ({ result = false, type, template, operations = [] } = {}) => {
// 	if (!result) return N.FailPeak.make({ operations })
// 	return N.SuccessPeak.make({ result, type, template })
// }

// /**
//  * @param {Timing} timing
//  * @returns {Timing}
//  */
// export const flipTiming = (timing) => {
// 	switch (timing) {
// 		case 0:
// 			return 0
// 		case -1:
// 			return 1
// 		case 1:
// 			return -1
// 	}

// 	throw new Error(`Unknown timing '${timing}'`)
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour: PulseColour,
//  * 	history: Parent[],
//  * 	future: Parent[],
//  * }} options
//  * @returns {Peak}
//  */
// const getPeakNow = (parent, { id, colour, history, future }) => {
// 	// First, let's try to find a real pulse
// 	const nod = getNod(parent, id)
// 	if (nod) {
// 		const pulse = nod.pulses[colour]
// 		if (pulse) {
// 			return createPeak({
// 				result: true,
// 				type: pulse.type,
// 				template: createTemplate(nod),
// 			})
// 		}
// 	}

// 	// Next, let's look through our inputs
// 	// to see if we can find a pulse
// 	for (const input of nod.inputs) {
// 		const wire = getWire(parent, input)

// 		if (wire.colour !== "any" && wire.colour !== colour) {
// 			continue
// 		}

// 		const peak = getPeak(parent, {
// 			id: wire.source,
// 			timing: flipTiming(wire.timing),
// 			colour,
// 			history,
// 			future,
// 		})

// 		if (peak.result) {
// 			return behave(parent, { peak, id })
// 		}
// 	}

// 	// Too bad, we couldn't find a pulse
// 	return createPeak()
// }

// /**
//  * Peak refers to the input that is causing this nod to fire
//  * @param {Parent} parent
//  * @param {{
//  * 	peak: SuccessPeak,
//  * 	id: Id,
//  * }} options
//  * @returns {Peak}
//  */
// export const behave = (parent, { peak, id }) => {
// 	const _behave = BEHAVES[peak.type]
// 	if (!_behave) {
// 		return peak
// 	}

// 	const transformedPeak = _behave(parent, { peak, id })
// 	if (!transformedPeak) {
// 		throw new Error("Nod behave must return a peak")
// 	}

// 	if (shouldValidate()) {
// 		validate(transformedPeak)
// 		for (const operation of peak.operations) {
// 			validate(operation, N.Operation)
// 		}
// 	}

// 	return transformedPeak
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour: PulseColour,
//  * 	history: Parent[],
//  * 	future: Parent[],
//  * }} options
//  * @returns {Peak}
//  */
// const getPeakBefore = (parent, { id, colour, history, future }) => {
// 	// If we have a recorded history
// 	// ... let's just travel back in time!
// 	const before = history.at(-1)
// 	if (before) {
// 		return getPeak(before, {
// 			id,
// 			timing: 0,
// 			colour,
// 			history: history.slice(0, -1),
// 			future: [parent, ...future],
// 		})
// 	}

// 	// Otherwise, let's try to imagine it...
// 	const projectedBefore = project(parent)

// 	// But wait!
// 	// Are we repeating ourselves?
// 	const after = future.at(0)
// 	if (after) {
// 		const afterStamp = JSON.stringify(after)
// 		const parentStamp = JSON.stringify(parent)
// 		if (afterStamp === parentStamp) {
// 			// Recursion detected!
// 			return createPeak()
// 		}
// 	}

// 	// No, we're fine!
// 	return getPeak(projectedBefore, {
// 		id,
// 		timing: 0,
// 		colour,
// 		history: [],
// 		future: [parent, ...future],
// 	})
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour: PulseColour,
//  * 	history: Parent[],
//  * 	future: Parent[],
//  * }} options
//  * @returns {Peak}
//  */
// const getPeakAfter = (parent, { id, colour, history, future }) => {
// 	// If we have a recorded future
// 	// ... let's just travel forward in time!
// 	const after = future.at(0)
// 	if (after) {
// 		return getPeak(after, {
// 			id,
// 			timing: 0,
// 			colour,
// 			history: [...history, parent],
// 			future: future.slice(1),
// 		})
// 	}

// 	// Otherwise, let's try to imagine it...
// 	const projectedAfter = project(parent)

// 	// But wait!
// 	// Are we repeating ourselves?
// 	const before = history.at(-1)
// 	if (before) {
// 		const beforeStamp = JSON.stringify(before)
// 		const parentStamp = JSON.stringify(parent)
// 		if (beforeStamp === parentStamp) {
// 			// Recursion detected!
// 			return createPeak()
// 		}
// 	}

// 	// No, we're fine!
// 	return getPeak(projectedAfter, {
// 		id,
// 		timing: 0,
// 		colour,
// 		history: [...history, parent],
// 		future: [],
// 	})
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	timing?: Timing,
//  * 	history?: Parent[],
//  * 	future?: Parent[],
//  * }} options
//  * @returns {FullPeak}
//  */
// export const getFullPeak = (parent, { id, timing = 0, history = [], future = [] }) => {
// 	const fullPeak = N.FullPeak.make()
// 	for (const colour of PULSE_COLOURS) {
// 		const peak = getPeak(parent, { id, colour, timing, history, future })
// 		fullPeak[colour] = peak
// 	}
// 	validate(fullPeak)
// 	return fullPeak
// }

// //============//
// // Projecting //
// //============//
// /**
//  *
//  * @param {Parent} parent
//  * @returns {Parent}
//  */
// export const project = (parent) => {
// 	const projection = structuredClone(parent)
// 	for (const id in projection.children) {
// 		const child = projection.children[id]
// 		if (!child.isNod) continue
// 		child.pulses.red = null
// 		child.pulses.green = null
// 		child.pulses.blue = null
// 	}
// 	return projection
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	clone?: boolean,
//  * }} options
//  * @returns
//  */
// export const deepProject = (parent, { clone = true } = {}) => {
// 	const projection = clone ? structuredClone(parent) : parent
// 	for (const id in projection.children) {
// 		const child = projection.children[id]
// 		if (!child.isNod) continue
// 		const isFiring = child.pulses.red || child.pulses.green || child.pulses.blue
// 		child.pulses.red = null
// 		child.pulses.green = null
// 		child.pulses.blue = null
// 		if (!isFiring) continue
// 		deepProject(child, { clone: false })
// 	}
// 	return projection
// }

// //===========//
// // Advancing //
// //===========//
// /**
//  * Propogate iterates through all nods
//  * ... and makes them fire if they should be firing.
//  *
//  * It's quite a heavy function to be calling so often.
//  * We could cut down its use, and also optimise it a lot.
//  * But so far it's been fine!
//  *
//  * eg: We should only really look through *some* of the nods
//  *     (eg: ones that are now-pointed to by a firing nod)
//  *     (eg: ones that are next-pointed to by a previously-firing nod)
//  *     (eg: ones that are previous-pointed to by a future-firing nod)
//  *     But maybe it's actually more efficient to just look through all of them??
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	clone?: Parent,
//  * 	history?: Parent[],
//  * 	future?: Parent[],
//  * 	timing?: Timing,
//  * }?} options
//  * @returns {Operation[]}
//  */
// export const propogate = (
// 	parent,
// 	{ clone = structuredClone(parent), history = [], future = [], timing = 0 } = {},
// ) => {
// 	/** @type {Operation[]} */
// 	const operations = []
// 	for (const _id in clone.children) {
// 		const id = +_id
// 		const child = clone.children[id]
// 		if (!child.isNod) continue
// 		const fullPeak = getFullPeak(clone, { id, history, future, timing })
// 		for (const colour of PULSE_COLOURS) {
// 			const peak = fullPeak[colour]
// 			for (const operation of peak.operations) {
// 				operate(parent, { id, operation })
// 				operations.push(operation)
// 			}
// 			if (!peak.result) continue
// 			addPulse(parent, { id, colour, type: peak.type })
// 		}
// 	}
// 	validate(parent)
// 	return operations
// }

// /**
//  * @param {Parent} parent
//  * @param {{
//  * 	history?: Parent[],
//  * }?} options
//  * @returns {{ parent: Parent, operations: Operation[] }}
//  */
// export const advance = (parent, { history = [] } = {}) => {
// 	const projection = project(parent)
// 	const operations = propogate(projection, {
// 		clone: parent,
// 		history,
// 		timing: 1,
// 	})
// 	return { parent: projection, operations }
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	history?: Parent[],
//  * }?} options
//  * @returns {{parent: Parent, operations: Operation[]}}
//  */
// export const deepAdvance = (parent, { history = [] } = {}) => {
// 	// TODO: This should be reported from the 'advance' function (and by extension, the 'project' function)
// 	// (so that we don't have to do it twice)
// 	const firingChildrenIds = []
// 	for (const _id in parent.children) {
// 		const id = +_id
// 		const child = parent.children[id]
// 		if (!child.isNod) continue
// 		const isFiring = child.pulses.red || child.pulses.green || child.pulses.blue
// 		if (!isFiring) continue
// 		firingChildrenIds.push(id)
// 	}

// 	const { parent: advancedParent, operations: layerOperations } = advance(parent, {
// 		history,
// 	})

// 	const operations = layerOperations

// 	for (const id of firingChildrenIds) {
// 		const firedOperation = N.FiredOperation.make()
// 		operations.push(firedOperation)

// 		const child = getNod(advancedParent, id)
// 		const childHistory = history.map((parent) => getNod(parent, id))
// 		const { parent: advancedChild, operations: advancedChildOperations } = deepAdvance(child, {
// 			history: childHistory,
// 		})
// 		operations.push(...advancedChildOperations)
// 		advancedParent.children[id] = advancedChild
// 	}
// 	validate(advancedParent)
// 	for (const operation of operations) {
// 		validate(operation, N.Operation)
// 	}
// 	return { parent: advancedParent, operations }
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	operation: Operation,
//  * }} options
//  */
// export const operate = (parent, { id, operation }) => {
// 	const _operate = OPERATES[operation.type]
// 	if (!_operate) {
// 		throw new Error(`Unknown operation type '${operation.type}'`)
// 	}

// 	_operate(parent, { id, data: operation.data })
// }
