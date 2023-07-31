import { objectEquals } from "../../libraries/utilities.js"
import { BEHAVIOURS } from "./behave.js"
import { NoganSchema, PULSE_COLOURS } from "./schema.js"

const N = NoganSchema

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

/**
 * Reach unimplemented code.
 * @returns {never}
 */
export const unimplemented = () => {
	throw new Error("Unimplemented")
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

/**
 * Checks if a cell is the root cell.
 * @param {CellId} id
 * @returns {boolean}
 */
export const isRoot = (id) => {
	return id === 0
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

/**
 * Modify a cell.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * 	type?: CellType,
 * 	position?: Vector2D,
 * 	propogate?: boolean,
 * }} options
 */
export const modifyCell = (nogan, { id, type, position, propogate = false }) => {
	const cell = getCell(nogan, id)
	cell.type = type ?? cell.type
	cell.position = position ?? cell.position

	if (propogate) {
		unimplemented()
	}

	validate(cell, N.Cell)
	validate(nogan, N.Nogan)
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
	if (check) validate(wire, N.Wire)
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

/**
 * Modify a wire.
 * @param {Nogan} nogan
 * @param {{
 * 	id: WireId,
 * 	colour?: WireColour,
 * 	timing?: Timing,
 * 	propogate?: boolean,
 * }} options
 */
export const modifyWire = (nogan, { id, colour, timing, propogate = false }) => {
	const wire = getWire(nogan, id)
	wire.colour = colour ?? wire.colour
	wire.timing = timing ?? wire.timing

	if (propogate) {
		unimplemented()
	}

	validate(wire, N.Wire)
	validate(nogan, N.Nogan)
}

//=======//
// Pulse //
//=======//
/**
 * Create a pulse.
 * @param {Pulse} options
 * @returns {Pulse}
 */
export const createPulse = (options = { type: "raw" }) => {
	const pulse = N.Pulse.make(options)
	validate(pulse, N.Pulse)
	return pulse
}

/**
 * Create a fire.
 * @param {{
 * 	red?: Pulse,
 * 	green?: Pulse,
 * 	blue?: Pulse,
 * }} options
 * @returns {Fire}
 */
export const createFire = ({ red, green, blue } = {}) => {
	const fire = N.Fire.make({ red, green, blue })
	validate(fire, N.Fire)
	return fire
}

/**
 * Fire a cell.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * 	colour?: PulseColour,
 * 	pulse?: Pulse,
 * 	propogate?: boolean,
 * }} options
 */
export const fireCell = (
	nogan,
	{ id, colour = "blue", pulse = { type: "raw" }, propogate = false },
) => {
	const cell = getCell(nogan, id)
	const { fire } = cell

	// Perform behaviours
	const peak = createPeak({ pulse }) //todo: behave?... behave(parent, { pulse, id })
	if (!peak.result) return

	// Update our pulse
	fire[colour] = peak.pulse

	// Propogate changes
	if (propogate) {
		unimplemented()
	}

	validate(cell, N.Cell)
	validate(nogan, N.Nogan)
	validate(pulse, N.Pulse)
}

//=========//
// Project //
//=========//
/**
 * Clone a nogan, ending all fires of cells whose parents are firing.
 * @param {Nogan} nogan
 * @returns {Nogan}
 */
export const getProjectedNogan = (nogan) => {
	const projection = structuredClone(nogan)
	projection.type = "projection"

	for (const cell of iterateCells(projection)) {
		const { parent } = cell
		if (!isRoot(parent) && !isFiring(nogan, { id: parent })) continue
		cell.fire = createFire()
	}

	validate(projection, N.Nogan)
	return projection
}

//======//
// Peak //
//======//
/**
 * Create a peak.
 * @param {{
 * 	operations?: Operation[],
 * 	pulse?: Pulse | null,
 * }} options
 * @returns {Peak}
 */
export const createPeak = ({ operations = [], pulse } = {}) => {
	const peak = pulse ? N.SuccessPeak.make({ operations, pulse }) : N.FailPeak.make({ operations })
	validate(peak, N.Peak)
	return peak
}

/**
 * Flip a timing.
 * @param {Timing} timing
 * @returns {Timing}
 */
const getFlippedTiming = (timing) => {
	switch (timing) {
		case -1:
			return 1
		case 0:
			return 0
		case 1:
			return -1
	}
}

/**
 * Returns true if the peak is final.
 * In other words, if it wouldn't be changed by any further pulses.
 * This is specific to Arroost, not nogan.
 * It's done so that we can stop iterating through wires that wouldn't change anything.
 * @param {Peak} peak
 * @returns
 */
const isPeakFinal = (peak) => {
	return peak.result && peak.pulse.type !== "raw"
}

/**
 * Peak at a cell to see how it's firing.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * 	colour?: PulseColour,
 * 	timing?: Timing,
 * 	past?: Nogan[],
 * 	future?: Nogan[],
 * }} options
 * @returns {Peak}
 */
export const getPeak = (nogan, { id, colour = "blue", timing = 0, past = [], future = [] }) => {
	if (timing === 0) {
		return getPeakNow(nogan, { id, colour, past, future })
	}

	return getDirectedPeak(nogan, { id, colour, past, future, direction: timing })
}

/**
 * Peak at a cell to see how it's firing right now.
 * @type {Peaker}
 */
const getPeakNow = (nogan, { id, colour, past, future }) => {
	const cell = getCell(nogan, id)
	const { fire } = cell
	const pulse = fire[colour]

	let peak = createPeak({ pulse })
	if (isPeakFinal(peak)) return peak

	for (const input of cell.inputs) {
		const wire = getWire(nogan, input)
		if (wire.colour !== "any" && wire.colour !== colour) {
			continue
		}

		const inputPeak = getPeak(nogan, {
			id: wire.source,
			timing: getFlippedTiming(wire.timing),
			colour,
			past,
			future,
		})

		peak = getBehavedPeak({ previous: peak, next: inputPeak })
		if (isPeakFinal(peak)) return peak
	}

	return peak
}

/**
 * Peak at a cell in the future or past.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * 	colour: PulseColour,
 * 	past: Nogan[],
 * 	future: Nogan[],
 * 	direction: Direction
 * }} options
 * @returns {Peak}
 */
const getDirectedPeak = (nogan, { id, colour, past, future, direction }) => {
	const to = direction === 1 ? future : past
	const from = direction === 1 ? past : future

	// First, let's try to look in the known future/past
	const [next, ...rest] = to
	if (next) {
		return getPeakNow(next, {
			id,
			colour,
			past: direction === 1 ? [nogan, ...past] : rest,
			future: direction === 1 ? rest : [nogan, ...future],
		})
	}

	// Otherwise, let's prepare to imagine the future/past
	const projectedNext = getProjectedNogan(nogan)

	// But wait!
	// Are we stuck in a loop?
	const previous = from.at(0)
	if (objectEquals(previous, projectedNext)) {
		return createPeak()
	}

	// If not, let's imagine the future/past!
	return getDirectedPeak(nogan, {
		id,
		colour,
		past: direction === 1 ? from : [projectedNext],
		future: direction === 1 ? [projectedNext] : from,
		direction,
	})
}

/**
 * Check if a cell is firing right now.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * }} options
 * @returns {boolean}
 */
export const isFiring = (nogan, { id }) => {
	for (const colour of PULSE_COLOURS) {
		const peak = getPeak(nogan, { id, colour })
		if (peak.result) return true
	}
	return false
}

//========//
// Behave //
//========//
/**
 * Apply a behaviour to a peak.
 * @type {Behaviour}
 */
const getBehavedPeak = ({ previous, next }) => {
	if (!next.result) {
		return previous
	}

	const behaviour = BEHAVIOURS[next.pulse.type]
	const behaved = behaviour({ previous, next })
	validate(behaved, N.Peak)
	return behaved
}

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour: PulseColour,
//  * 	past: Parent[],
//  * 	future: Parent[],
//  * }} options
//  * @returns {Peak}
//  */
// const getPeakBefore = (parent, { id, colour, past, future }) => {
// 	// If we have a recorded past
// 	// ... let's just travel back in time!
// 	const before = past.at(-1)
// 	if (before) {
// 		return getPeak(before, {
// 			id,
// 			timing: 0,
// 			colour,
// 			past: past.slice(0, -1),
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
// 		past: [],
// 		future: [parent, ...future],
// 	})
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	id: Id,
//  * 	colour: PulseColour,
//  * 	past: Parent[],
//  * 	future: Parent[],
//  * }} options
//  * @returns {Peak}
//  */
// const getPeakAfter = (parent, { id, colour, past, future }) => {
// 	// If we have a recorded future
// 	// ... let's just travel forward in time!
// 	const after = future.at(0)
// 	if (after) {
// 		return getPeak(after, {
// 			id,
// 			timing: 0,
// 			colour,
// 			past: [...past, parent],
// 			future: future.slice(1),
// 		})
// 	}

// 	// Otherwise, let's try to imagine it...
// 	const projectedAfter = project(parent)

// 	// But wait!
// 	// Are we repeating ourselves?
// 	const before = past.at(-1)
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
// 		past: [...past, parent],
// 		future: [],
// 	})
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
//  * 	timing?: Timing,
//  * 	past?: Parent[],
//  * 	future?: Parent[],
//  * }} options
//  * @returns {FullPeak}
//  */
// export const getFullPeak = (parent, { id, timing = 0, past = [], future = [] }) => {
// 	const fullPeak = N.FullPeak.make()
// 	for (const colour of PULSE_COLOURS) {
// 		const peak = getPeak(parent, { id, colour, timing, past, future })
// 		fullPeak[colour] = peak
// 	}
// 	validate(fullPeak)
// 	return fullPeak
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
//  * 	past?: Parent[],
//  * 	future?: Parent[],
//  * 	timing?: Timing,
//  * }?} options
//  * @returns {Operation[]}
//  */
// export const propogate = (
// 	parent,
// 	{ clone = structuredClone(parent), past = [], future = [], timing = 0 } = {},
// ) => {
// 	/** @type {Operation[]} */
// 	const operations = []
// 	for (const _id in clone.children) {
// 		const id = +_id
// 		const child = clone.children[id]
// 		if (!child.isNod) continue
// 		const fullPeak = getFullPeak(clone, { id, past, future, timing })
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
//  * 	past?: Parent[],
//  * }?} options
//  * @returns {{ parent: Parent, operations: Operation[] }}
//  */
// export const advance = (parent, { past = [] } = {}) => {
// 	const projection = project(parent)
// 	const operations = propogate(projection, {
// 		clone: parent,
// 		past,
// 		timing: 1,
// 	})
// 	return { parent: projection, operations }
// }

// /**
//  *
//  * @param {Parent} parent
//  * @param {{
//  * 	past?: Parent[],
//  * }?} options
//  * @returns {{parent: Parent, operations: Operation[]}}
//  */
// export const deepAdvance = (parent, { past = [] } = {}) => {
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
// 		past,
// 	})

// 	const operations = layerOperations

// 	for (const id of firingChildrenIds) {
// 		const firedOperation = N.FiredOperation.make()
// 		operations.push(firedOperation)

// 		const child = getNod(advancedParent, id)
// 		const childHistory = past.map((parent) => getNod(parent, id))
// 		const { parent: advancedChild, operations: advancedChildOperations } = deepAdvance(child, {
// 			past: childHistory,
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
