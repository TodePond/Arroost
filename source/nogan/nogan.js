import { objectEquals } from "../../libraries/utilities.js"
import { BEHAVIOURS } from "./behave.js"
import { NoganSchema, PULSE_COLOURS } from "./schema.js"

const N = NoganSchema

/** @type {AsConst} */
export const c = (v) => v

//============//
// Validating //
//============//
/** @type {boolean | undefined} */
const SHOULD_VALIDATE_OVERRIDE = undefined

/** @type {boolean | null} */
let _shouldValidate = null

/**
 * Should we validate?
 * @returns {boolean}
 */
export const shouldValidate = () => {
	if (SHOULD_VALIDATE_OVERRIDE !== undefined) return SHOULD_VALIDATE_OVERRIDE
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

//=========//
// Memoise //
//=========//
/** @implements {Memo<any, any, any>} */
const Cache = class {
	static RESERVED = Symbol("reserved")
	static NEW = Symbol("new")
	entries = new Map()

	/** @param {any} args */
	encode(args) {
		return JSON.stringify(args)
	}

	/** @param {any} key */
	query(key) {
		if (!this.entries.has(key)) {
			this.entries.set(key, Cache.RESERVED)
			return Cache.NEW
		}
		return this.entries.get(key)
	}

	/**
	 * @param {any} key
	 * @param {any} value
	 */
	store(key, value) {
		this.entries.set(key, value)
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
 * Get a JSON string of a nogan.
 * @param {Nogan} nogan
 * @returns {string}
 */
export const getJSON = (nogan) => {
	if (!nogan.json) nogan.json = JSON.stringify(nogan)
	validate(nogan, N.Nogan)
	return nogan.json
}

/**
 * Clear a nogan's cache.
 * @param {Nogan} nogan
 */
const clearCache = (nogan) => {
	nogan.json = null
}

/**
 * Get a clone of a nogan.
 * @param {Nogan} nogan
 * @returns {Nogan}
 */
export const getClone = (nogan) => {
	const json = getJSON(nogan)
	return JSON.parse(json)
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
		clearCache(nogan)
		validate(nogan, N.Nogan)
		validate(id, N.CellId)
		// @ts-expect-error
		return id
	}

	const id = nogan.nextCell
	nogan.nextCell++
	nogan.items[id] = null
	clearCache(nogan)
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
		clearCache(nogan)
		validate(nogan, N.Nogan)
		validate(id, N.WireId)
		// @ts-expect-error
		return id
	}

	const id = nogan.nextWire
	nogan.nextWire--
	nogan.items[id] = null
	clearCache(nogan)
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
	clearCache(nogan)
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
	clearCache(nogan)
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
	clearCache(nogan)
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
	clearCache(nogan)
	validate(nogan, N.Nogan)
}

/**
 * Delete cell id archive.
 * @param {Nogan} nogan
 */
export const deleteArchivedCellIds = (nogan) => {
	nogan.deletedCells.push(...nogan.archivedCells)
	nogan.archivedCells = []
	clearCache(nogan)
	validate(nogan, N.Nogan)
}

/**
 * Delete wire id archive.
 * @param {Nogan} nogan
 */
export const deleteArchivedWireIds = (nogan) => {
	nogan.deletedWires.push(...nogan.archivedWires)
	nogan.archivedWires = []
	clearCache(nogan)
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

	clearCache(nogan)
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
 * Iterate through all cell ids.
 * @param {Nogan} nogan
 * @return {Iterable<CellId>}
 */
export function* iterateCellIds(nogan) {
	for (let id = 0; id < nogan.nextCell; id++) {
		const cell = nogan.items[id]
		if (!cell) continue
		validate(cell, N.Cell)
		validate(id, N.CellId)
		yield id
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

	clearCache(nogan)
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
 * 	past?: Nogan[],
 * 	future?: Nogan[],
 * }} options
 */
export const modifyCell = (
	nogan,
	{ id, type, position, propogate = true, past = [], future = [] },
) => {
	const cell = getCell(nogan, id)
	cell.type = type ?? cell.type
	cell.position = position ?? cell.position
	clearCache(nogan)

	if (propogate) {
		refresh(nogan, { past, future })
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
 *  propogate?: boolean,
 * 	past?: Nogan[],
 * 	future?: Nogan[],
 * }} options
 * @returns {Wire}
 */
export const createWire = (
	nogan,
	{ source, target, colour = "any", timing = 0, propogate = true, past = [], future = [] },
) => {
	const id = reserveWireId(nogan)
	const wire = N.Wire.make({ id, source, target, colour, timing })
	nogan.items[id] = wire

	const sourceCell = getCell(nogan, source)
	const targetCell = getCell(nogan, target)
	sourceCell.outputs.push(id)
	targetCell.inputs.push(id)
	clearCache(nogan)

	if (propogate) {
		refresh(nogan, { past, future })
	}

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
 * Iterate through all wire ids.
 * @param {Nogan} nogan
 * @return {Iterable<WireId>}
 */
export function* iterateWireIds(nogan) {
	for (let id = -1; id >= nogan.nextWire; id--) {
		const wire = nogan.items[id]
		if (!wire) continue
		validate(wire, N.Wire)
		validate(id, N.WireId)
		yield id
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
 * 	past?: Nogan[],
 * 	future?: Nogan[],
 * }} options
 */
export const modifyWire = (
	nogan,
	{ id, colour, timing, propogate = true, past = [], future = [] },
) => {
	const wire = getWire(nogan, id)
	wire.colour = colour ?? wire.colour
	wire.timing = timing ?? wire.timing
	clearCache(nogan)

	if (propogate) {
		refresh(nogan, { past, future })
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
 * 	past?: Nogan[],
 * 	future?: Nogan[],
 * }} options
 * @returns {Operation[]}
 */
export const fireCell = (
	nogan,
	{ id, colour = "blue", pulse = { type: "raw" }, propogate = true, past = [], future = [] },
) => {
	const cell = getCell(nogan, id)
	const { fire } = cell
	fire[colour] = pulse
	clearCache(nogan)

	if (propogate) {
		return refresh(nogan, { past, future })
	}

	validate(cell, N.Cell)
	validate(nogan, N.Nogan)
	validate(pulse, N.Pulse)
	return []
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
	const projection = getClone(nogan)

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
 * @typedef {{
 *  nogan: Nogan,
 *  id: CellId,
 *  colour: PulseColour,
 *  timing: Timing,
 *  past: Nogan[],
 *  future: Nogan[],
 * }} GetPeakOptions
 */

/** @implements {Memo<Peak, string, GetPeakOptions>} */
const GetPeakMemo = class extends Cache {
	/** @param {GetPeakOptions} options */
	encode({ nogan, id, colour, timing, past, future }) {
		return [
			getJSON(nogan),
			id,
			colour,
			timing,
			past.map((v) => getJSON(v)),
			future.map((v) => getJSON(v)),
		].join("|")
	}
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
 *  memo?: GetPeakMemo,
 * }} options
 * @returns {Peak}
 */
export const getPeak = (
	nogan,
	{ id, colour = "blue", timing = 0, past = [], future = [], memo = new GetPeakMemo() },
) => {
	const key = memo.encode({ nogan, id, colour, timing, past, future })
	const cached = memo.query(key)

	if (cached === Cache.RESERVED) {
		// Infinite wire loop detected!
		return createPeak()
	} else if (cached !== Cache.NEW) {
		return cached
	}

	if (timing === 0) {
		const peak = getPeakNow(nogan, { id, colour, past, future, memo })
		memo.store(key, peak)
		return peak
	}

	const to = timing === 1 ? future : past
	const from = timing === 1 ? past : future

	// First, let's try to look in the known future/past
	const [next, ...rest] = to
	if (next) {
		const peak = getPeakNow(next, {
			id,
			colour,
			past: timing === 1 ? [nogan, ...past] : rest,
			future: timing === 1 ? rest : [nogan, ...future],
			memo,
		})
		memo.store(key, peak)
		return peak
	}

	// Otherwise, let's prepare to imagine the future/past
	const projectedNext = getProjectedNogan(nogan)

	// But wait!
	// Are we stuck in a loop?
	if (objectEquals(from.at(0), nogan)) {
		return createPeak()
	}

	// If not, let's imagine the future/past!
	const peak = getPeakNow(projectedNext, {
		id,
		colour,
		past: timing === 1 ? [nogan, ...past] : [],
		future: timing === 1 ? [] : [nogan, ...future],
		memo,
	})
	memo.store(key, peak)
	return peak
}

/**
 * Peak at a cell to see how it's firing right now.
 * @param {Nogan} nogan
 * @param {{
 * 	id: CellId,
 * 	colour: PulseColour,
 * 	past: Nogan[],
 * 	future: Nogan[],
 *	memo?: GetPeakMemo,
 * }} options
 * @returns {Peak}
 */
const getPeakNow = (nogan, { id, colour, past, future, memo = new GetPeakMemo() }) => {
	const cell = getCell(nogan, id)
	const { fire } = cell
	const pulse = fire[colour]

	let peak = createPeak({ pulse })

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
			memo,
		})

		peak = getBehavedPeak({ previous: peak, next: inputPeak })
	}

	return peak
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

//=========//
// Refresh //
//=========//
/**
 * Refresh a the state of all cells in a nogan.
 * @param {Nogan} nogan
 * @param {{
 * 	snapshot?: Nogan,
 * 	past?: Nogan[],
 * 	future?: Nogan[],
 * }} options
 * @return {Operation[]}
 */
export const refresh = (nogan, { snapshot = getClone(nogan), past = [], future = [] } = {}) => {
	const operations = []
	for (const id of iterateCellIds(snapshot)) {
		for (const colour of PULSE_COLOURS) {
			const peak = getPeak(snapshot, { id, colour, past, future })
			if (!peak.result) continue
			fireCell(nogan, { id, colour, pulse: peak.pulse, propogate: false })
			operations.push(...peak.operations)
		}
	}
	return operations
}

//===========//
// Advancing //
//===========//
/**
 * Gets the state of a nogan on the next beat.
 * It does this by projecting the nogan and then refreshing it, using the current nogan as the past.
 * @param {Nogan} nogan
 * @param {{
 * 	past?: Nogan[],
 * }} options
 * @returns {Nogan}
 */
export const getAdvanced = (nogan, { past = [] } = {}) => {
	const projection = getProjectedNogan(nogan)
	const operations = refresh(projection, { past: [nogan, ...past] })
	validate(projection, N.Nogan)
	return projection
}

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
