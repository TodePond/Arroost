import { memo } from "../../libraries/habitat-import.js"
import { Schema } from "../../libraries/schema.js"
import { BEHAVES } from "./behave.js"
import { OPERATES } from "./operate.js"
import { NoganSchema, PULSE_COLOURS } from "./schema.js"

const N = NoganSchema
const S = Schema

/** @type any */
const _window = window

//============//
// Validating //
//============//
export const shouldValidate = memo(
	() => _window.shared && _window.shared.debug.validate,
	() => "",
)

/**
 * @param {Validatable} value
 * @param {Schema?} schema
 */
export const validate = (
	value,
	// @ts-expect-error
	schema = NoganSchema[value.schemaName],
) => {
	if (shouldValidate()) {
		return
	}
	if (!schema) {
		console.error(value)
		throw new Error(`Can't find schema for value ^`)
	}
	try {
		schema.validate(value)
	} catch (error) {
		console.log(value)
		console.error(schema.diagnose(value))
		throw error
	}
}

/**
 * Check that the parent has the child as a child.
 * @param {Parent} parent
 * @param {Child} child
 */
export const validateFamily = (parent, child) => {
	if (_window.shared && !_window.shared.debug.validate) {
		return
	}
	if (parent.children[child.id] !== child) {
		console.error(parent, child)
		throw new Error("Mummy does not have the provided child")
	}

	validate(parent)
	validate(child)
}

//========//
// Family //
//========//
/**
 *
 * @param {Parent} parent
 * @returns {Id}
 */
export const createId = (parent) => {
	if (parent.freeIds.length > 0) {
		return parent.freeIds.pop()
	}
	const id = parent.nextId
	parent.nextId++
	return id
}

/**
 *
 * @param {Parent} parent
 * @param {Id} id
 */
export const freeId = (parent, id) => {
	parent.freeIds.push(id)
}

/**
 *
 * @param {Parent} parent
 * @param {Child} child
 */
export const addChild = (parent, child) => {
	const id = createId(parent)
	child.id = id
	parent.children[id] = child

	validate(child)
	validate(parent)
}

/**
 *
 * @param {Parent} parent
 * @param {Id} id
 */
export const deleteChild = (parent, id) => {
	const child = parent.children[id]
	child.id = null
	parent.children[id] = null
	freeId(parent, id)

	validate(parent)
}

/**
 * @param {Parent} parent
 * @param {Id} id
 * @returns {Nod}
 */
export const getNod = (parent, id) => {
	const nod = parent.children[id]
	if (shouldValidate()) {
		if (!nod) {
			throw new Error(`Can't find nod with id '${id}'`)
		}
		validate(nod, N.Nod)
	}
	// @ts-expect-error
	return nod
}

/**
 * @param {Parent} parent
 * @param {Id} id
 * @returns {Wire}
 */
export const getWire = (parent, id) => {
	const nod = parent.children[id]
	if (shouldValidate()) {
		if (!nod) {
			throw new Error(`Can't find nod with id '${id}'`)
		}
		validate(nod, N.Wire)
	}
	// @ts-expect-error
	return nod
}

//==========//
// Creating //
//==========//
/**
 * @returns {Phantom}
 */
export const createPhantom = () => {
	const phantom = N.Phantom.make()
	validate(phantom)
	return phantom
}

/**
 *
 * @param {Parent} parent
 * @param {Partial<Nod>} properties
 * @returns {Nod}
 */
export const createNod = (parent, properties = {}) => {
	const nod = N.Nod.make(properties)
	addChild(parent, nod)
	return nod
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	source: Id,
 * 	target: Id,
 * 	colour?: WireColour,
 * 	timing?: Timing,
 * }} options
 * @returns Wire
 */
export const createWire = (parent, { source, target, colour = "any", timing = 0 }) => {
	const wire = N.Wire.make({ colour, timing })
	wire.source = source
	wire.target = target
	addChild(parent, wire)

	const sourceNod = getNod(parent, source)
	const targetNod = getNod(parent, target)
	sourceNod.outputs.push(wire.id)
	targetNod.inputs.push(wire.id)

	validate(parent)
	validate(sourceNod)
	validate(targetNod)
	validate(wire)

	return wire
}

/**
 *
 * @param {Nod} nod
 * @returns {NodTemplate}
 */
export const createTemplate = (nod) => {
	const template = N.NodTemplate.make({
		position: nod.position,
		type: nod.type,
	})
	validate(template, N.NodTemplate)
	return template
}

//===========//
// Destroying //
//===========//
/**
 * @param {Parent} parent
 * @param {Id} id
 */
export const destroyWire = (parent, id) => {
	const wire = getWire(parent, id)
	const sourceNod = getNod(parent, wire.source)
	const targetNod = getNod(parent, wire.target)

	const sourceIndex = sourceNod.outputs.indexOf(wire.id)
	const targetIndex = targetNod.inputs.indexOf(wire.id)

	sourceNod.outputs.splice(sourceIndex, 1)
	targetNod.inputs.splice(targetIndex, 1)
	deleteChild(parent, id)

	validate(parent)
	validate(sourceNod)
	validate(targetNod)
}

/**
 *
 * @param {Parent} parent
 * @param {Id} id
 */
export const destroyNod = (parent, id) => {
	const nod = getNod(parent, id)
	if (nod.inputs.length > 0 || nod.outputs.length > 0) {
		throw new Error("Cannot destroy nod with wires")
	}

	deleteChild(parent, id)
	validate(parent)
}

//============//
// Connecting //
//============//
/**
 *
 * @param {Parent} parent
 * @param {{
 * 	original: Id,
 * 	replacement: Id,
 * }} options
 */
export const replaceNod = (parent, { original, replacement }) => {
	if (original === replacement) return

	const originalNod = getNod(parent, original)
	const replacementNod = getNod(parent, replacement)

	replacementNod.inputs = [...originalNod.inputs]
	replacementNod.outputs = [...originalNod.outputs]
	originalNod.inputs = []
	originalNod.outputs = []

	for (const input of replacementNod.inputs) {
		const wire = getWire(parent, input)
		wire.target = replacement
	}

	for (const output of replacementNod.outputs) {
		const wire = getWire(parent, output)
		wire.source = replacement
	}

	validate(parent)
	validate(originalNod)
	validate(replacementNod)
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	source?: Id,
 * 	target?: Id,
 * }} options
 */
export const reconnectWire = (parent, { id, source, target }) => {
	const wire = getWire(parent, id)
	const replacementSourceId = source ?? wire.source
	const replacementTargetId = target ?? wire.target

	const originalSource = getNod(parent, wire.source)
	const originalTarget = getNod(parent, wire.target)

	const replacementSource = getNod(parent, replacementSourceId)
	const replacementTarget = getNod(parent, replacementTargetId)

	if (originalSource !== replacementSource) {
		const sourceIndex = originalSource.outputs.indexOf(id)
		originalSource.outputs.splice(sourceIndex, 1)
		replacementSource.outputs.push(id)
		wire.source = source
	}

	if (originalTarget !== replacementTarget) {
		const targetIndex = originalTarget.inputs.indexOf(id)
		originalTarget.inputs.splice(targetIndex, 1)
		replacementTarget.inputs.push(id)
		wire.target = target
	}

	validate(parent)
	validate(originalSource)
	validate(originalTarget)
	validate(replacementSource)
	validate(replacementTarget)
}

//=========//
// Pulsing //
//=========//
/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	colour?: PulseColour,
 * 	type?: PulseType,
 * }} options
 * @returns
 */
export const addPulse = (parent, { id, colour = "blue", type = "any" }) => {
	const nod = getNod(parent, id)
	const { pulses } = nod
	const pulse = pulses[colour]

	const phantomPeak = N.SuccessPeak.make({
		result: true,
		type,
		template: {},
	})

	const transformedPeak = behave(parent, { peak: phantomPeak, id })
	if (!transformedPeak.result) {
		return
	}

	// Don't do anything if we're already pulsing
	if (pulse?.type === transformedPeak.type) {
		return
	}

	// Update our pulse
	pulses[colour] = N.Pulse.make({ type: transformedPeak.type })

	// These operations could be collated together for a perf boost
	// --- Apply any operations ---
	propogate(parent)
	// --- End of operations ---

	validate(nod)
	validate(parent)
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * }} options
 */
export const addFullPulse = (parent, { id }) => {
	for (const colour of PULSE_COLOURS) {
		addPulse(parent, { id, colour })
	}
}

//===========//
// Modifying //
//===========//
/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	type?: NodType,
 * 	position?: Vector2D,
 * }} options
 */
export const modifyNod = (parent, { id, type, position }) => {
	const nod = getNod(parent, id)
	nod.type = type ?? nod.type
	nod.position = position ?? nod.position

	validate(parent)
	validate(nod)
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	colour?: WireColour,
 * 	timing?: Timing,
 * }} options
 */
export const modifyWire = (parent, { id, colour, timing }) => {
	const wire = getWire(parent, id)
	wire.colour = colour ?? wire.colour
	wire.timing = timing ?? wire.timing

	validate(parent)
	validate(wire)
}

//=========//
// Peaking //
//=========//
/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	colour?: PulseColour,
 * 	timing?: Timing,
 * 	history?: Parent[],
 * 	future?: Parent[],
 * }} options
 * @returns {Peak}
 */
export const getPeak = (
	parent,
	{ id, colour = "blue", timing = 0, history = [], future = [] },
) => {
	const peak = _getPeak(parent, { id, colour, timing, history, future })
	validate(peak)
	validate(parent)
	return peak
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	colour?: PulseColour,
 * 	timing?: Timing,
 * 	history?: Parent[],
 * 	future?: Parent[],
 * }} options
 * @returns {Peak}
 */
const _getPeak = (parent, { id, colour, timing, history, future }) => {
	switch (timing) {
		case 0:
			return getPeakNow(parent, { id, colour, history, future })
		case -1:
			return getPeakBefore(parent, { id, colour, history, future })
		case 1:
			return getPeakAfter(parent, { id, colour, history, future })
	}

	return N.Never.make({ id, colour, timing, history })
}

/**
 *
 * @param {{
 * 	result?: boolean,
 * 	type?: PulseType,
 * 	template?: NodTemplate,
 * 	operations?: Operation[],
 * }?} options
 * @returns {Peak}
 */
export const createPeak = ({ result = false, type, template, operations = [] } = {}) => {
	if (!result) return N.FailPeak.make({ operations })
	return N.SuccessPeak.make({ result, type, template })
}

/**
 * @param {Timing} timing
 * @returns {Timing}
 */
export const flipTiming = (timing) => {
	switch (timing) {
		case 0:
			return 0
		case -1:
			return 1
		case 1:
			return -1
	}

	throw new Error(`Unknown timing '${timing}'`)
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	colour: PulseColour,
 * 	history: Parent[],
 * 	future: Parent[],
 * }} options
 * @returns {Peak}
 */
const getPeakNow = (parent, { id, colour, history, future }) => {
	// First, let's try to find a real pulse
	const nod = getNod(parent, id)
	if (nod) {
		const pulse = nod.pulses[colour]
		if (pulse) {
			return createPeak({
				result: true,
				type: pulse.type,
				template: createTemplate(nod),
			})
		}
	}

	// Next, let's look through our inputs
	// to see if we can find a pulse
	for (const input of nod.inputs) {
		const wire = getWire(parent, input)

		if (wire.colour !== "any" && wire.colour !== colour) {
			continue
		}

		const peak = getPeak(parent, {
			id: wire.source,
			timing: flipTiming(wire.timing),
			colour,
			history,
			future,
		})

		if (peak.result) {
			return behave(parent, { peak, id })
		}
	}

	// Too bad, we couldn't find a pulse
	return createPeak()
}

/**
 * Peak refers to the input that is causing this nod to fire
 * @param {Parent} parent
 * @param {{
 * 	peak: SuccessPeak,
 * 	id: Id,
 * }} options
 * @returns {Peak}
 */
export const behave = (parent, { peak, id }) => {
	const _behave = BEHAVES[peak.type]
	if (!_behave) {
		return peak
	}

	const transformedPeak = _behave(parent, { peak, id })
	if (!transformedPeak) {
		throw new Error("Nod behave must return a peak")
	}

	if (shouldValidate()) {
		validate(transformedPeak)
		for (const operation of peak.operations) {
			validate(operation, N.Operation)
		}
	}

	return transformedPeak
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	colour: PulseColour,
 * 	history: Parent[],
 * 	future: Parent[],
 * }} options
 * @returns {Peak}
 */
const getPeakBefore = (parent, { id, colour, history, future }) => {
	// If we have a recorded history
	// ... let's just travel back in time!
	const before = history.at(-1)
	if (before) {
		return getPeak(before, {
			id,
			timing: 0,
			colour,
			history: history.slice(0, -1),
			future: [parent, ...future],
		})
	}

	// Otherwise, let's try to imagine it...
	const projectedBefore = project(parent)

	// But wait!
	// Are we repeating ourselves?
	const after = future.at(0)
	if (after) {
		const afterStamp = JSON.stringify(after)
		const parentStamp = JSON.stringify(parent)
		if (afterStamp === parentStamp) {
			// Recursion detected!
			return createPeak()
		}
	}

	// No, we're fine!
	return getPeak(projectedBefore, {
		id,
		timing: 0,
		colour,
		history: [],
		future: [parent, ...future],
	})
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	colour: PulseColour,
 * 	history: Parent[],
 * 	future: Parent[],
 * }} options
 * @returns {Peak}
 */
const getPeakAfter = (parent, { id, colour, history, future }) => {
	// If we have a recorded future
	// ... let's just travel forward in time!
	const after = future.at(0)
	if (after) {
		return getPeak(after, {
			id,
			timing: 0,
			colour,
			history: [...history, parent],
			future: future.slice(1),
		})
	}

	// Otherwise, let's try to imagine it...
	const projectedAfter = project(parent)

	// But wait!
	// Are we repeating ourselves?
	const before = history.at(-1)
	if (before) {
		const beforeStamp = JSON.stringify(before)
		const parentStamp = JSON.stringify(parent)
		if (beforeStamp === parentStamp) {
			// Recursion detected!
			return createPeak()
		}
	}

	// No, we're fine!
	return getPeak(projectedAfter, {
		id,
		timing: 0,
		colour,
		history: [...history, parent],
		future: [],
	})
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	timing?: Timing,
 * 	history?: Parent[],
 * 	future?: Parent[],
 * }} options
 * @returns {FullPeak}
 */
export const getFullPeak = (parent, { id, timing = 0, history = [], future = [] }) => {
	const fullPeak = N.FullPeak.make()
	for (const colour of PULSE_COLOURS) {
		const peak = getPeak(parent, { id, colour, timing, history, future })
		fullPeak[colour] = peak
	}
	validate(fullPeak)
	return fullPeak
}

//============//
// Projecting //
//============//
/**
 *
 * @param {Parent} parent
 * @returns {Parent}
 */
export const project = (parent) => {
	const projection = structuredClone(parent)
	for (const id in projection.children) {
		const child = projection.children[id]
		if (!child.isNod) continue
		child.pulses.red = null
		child.pulses.green = null
		child.pulses.blue = null
	}
	return projection
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	clone?: boolean,
 * }} options
 * @returns
 */
export const deepProject = (parent, { clone = true } = {}) => {
	const projection = clone ? structuredClone(parent) : parent
	for (const id in projection.children) {
		const child = projection.children[id]
		if (!child.isNod) continue
		const isFiring = child.pulses.red || child.pulses.green || child.pulses.blue
		child.pulses.red = null
		child.pulses.green = null
		child.pulses.blue = null
		if (!isFiring) continue
		deepProject(child, { clone: false })
	}
	return projection
}

//===========//
// Advancing //
//===========//
/**
 * Propogate iterates through all nods
 * ... and makes them fire if they should be firing.
 *
 * It's quite a heavy function to be calling so often.
 * We could cut down its use, and also optimise it a lot.
 * But so far it's been fine!
 *
 * @param {Parent} parent
 * @param {{
 * 	clone?: Parent,
 * 	history?: Parent[],
 * 	future?: Parent[],
 * 	timing?: Timing,
 * }?} options
 * @returns {Operation[]}
 */
export const propogate = (
	parent,
	{ clone = structuredClone(parent), history = [], future = [], timing = 0 } = {},
) => {
	/** @type {Operation[]} */
	const operations = []
	for (const _id in clone.children) {
		const id = +_id
		const child = clone.children[id]
		if (!child.isNod) continue
		const fullPeak = getFullPeak(clone, { id, history, future, timing })
		for (const colour of PULSE_COLOURS) {
			const peak = fullPeak[colour]
			for (const operation of peak.operations) {
				operate(parent, { id, operation })
				operations.push(operation)
			}
			if (!peak.result) continue
			addPulse(parent, { id, colour, type: peak.type })
		}
	}
	validate(parent)
	return operations
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	history?: Parent[],
 * }?} options
 * @returns {{ parent: Parent, operations: Operation[] }}
 */
export const advance = (parent, { history = [] } = {}) => {
	const projection = project(parent)
	const operations = propogate(projection, {
		clone: parent,
		history,
		timing: 1,
	})
	return { parent: projection, operations }
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	history?: Parent[],
 * }?} options
 * @returns {{parent: Parent, operations: Operation[]}}
 */
export const deepAdvance = (parent, { history = [] } = {}) => {
	const firingChildrenIds = []
	for (const _id in parent.children) {
		const id = +_id
		const child = parent.children[id]
		if (!child.isNod) continue
		const isFiring = child.pulses.red || child.pulses.green || child.pulses.blue
		if (!isFiring) continue
		firingChildrenIds.push(id)
	}

	const { parent: advancedParent, operations: advancedChildOperations } = advance(parent, {
		history,
	})

	const operations = advancedChildOperations

	for (const id of firingChildrenIds) {
		const firedOperation = N.FiredOperation.make()
		operations.push(firedOperation)

		const child = getNod(advancedParent, id)
		const childHistory = history.map((parent) => getNod(parent, id))
		const { parent: advancedChild, operations: advancedChildOperations } = deepAdvance(child, {
			history: childHistory,
		})
		operations.push(...advancedChildOperations)
		advancedParent.children[id] = advancedChild
	}
	validate(advancedParent)
	for (const operation of operations) {
		validate(operation, N.Operation)
	}
	return { parent: advancedParent, operations }
}

/**
 *
 * @param {Parent} parent
 * @param {{
 * 	id: Id,
 * 	operation: Operation,
 * }} options
 */
export const operate = (parent, { id, operation }) => {
	const _operate = OPERATES[operation.type]
	if (!_operate) {
		throw new Error(`Unknown operation type '${operation.type}'`)
	}

	_operate(parent, { id, data: operation.data })
}
