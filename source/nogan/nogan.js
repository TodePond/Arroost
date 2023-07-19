import { memo } from "../../libraries/habitat-import.js"
import { BEHAVES } from "./behave.js"
import { OPERATES } from "./operate.js"
import { NoganSchema, PULSE_COLOURS } from "./schema.js"

const N = NoganSchema

//============//
// Validating //
//============//
export const shouldValidate = memo(
	() => window.shared && window.shared.debug.validate,
	() => "",
)

export const validate = (nogan, schema = NoganSchema[nogan.schemaName]) => {
	if (shouldValidate()) {
		return
	}
	try {
		schema.validate(nogan)
	} catch (error) {
		console.log(nogan)
		console.error(schema.diagnose(nogan))
		throw error
	}
}

// Check that the parent has the child as a child.
export const validateFamily = (parent, child) => {
	if (window.shared && !window.shared.debug.validate) {
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
export const createId = (nogan) => {
	if (nogan.freeIds.length > 0) {
		return nogan.freeIds.pop()
	}
	const id = nogan.nextId
	nogan.nextId++
	return id
}

export const freeId = (nogan, id) => {
	nogan.freeIds.push(id)
}

export const addChild = (nogan, child) => {
	const id = createId(nogan)
	child.id = id
	nogan.children[id] = child

	validate(child)
	validate(nogan)
}

export const deleteChild = (nogan, id) => {
	const child = nogan.children[id]
	child.id = null
	nogan.children[id] = null
	freeId(nogan, id)

	validate(nogan)
}

//==========//
// Creating //
//==========//
export const createPhantom = (properties = {}) => {
	const phantom = N.Phantom.make(properties)
	validate(phantom)
	return phantom
}

export const createNod = (parent, properties = {}) => {
	const nod = N.Nod.make(properties)
	addChild(parent, nod)
	return nod
}

export const createWire = (parent, { source, target, colour, timing }) => {
	const wire = N.Wire.make({ colour, timing })
	wire.source = source
	wire.target = target
	addChild(parent, wire)

	const sourceNogan = parent.children[source]
	const targetNogan = parent.children[target]
	sourceNogan.outputs.push(wire.id)
	targetNogan.inputs.push(wire.id)

	validate(parent)
	validate(sourceNogan)
	validate(targetNogan)
	validate(wire)

	return wire
}

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
export const destroyWire = (parent, id) => {
	const wire = parent.children[id]
	const sourceNogan = parent.children[wire.source]
	const targetNogan = parent.children[wire.target]

	const sourceIndex = sourceNogan.outputs.indexOf(wire.id)
	const targetIndex = targetNogan.inputs.indexOf(wire.id)

	sourceNogan.outputs.splice(sourceIndex, 1)
	targetNogan.inputs.splice(targetIndex, 1)
	deleteChild(parent, id)

	validate(parent)
	validate(sourceNogan)
	validate(targetNogan)
}

export const destroyNod = (parent, id) => {
	const nod = parent.children[id]
	if (nod.inputs.length > 0 || nod.outputs.length > 0) {
		throw new Error("Cannot destroy nod with wires")
	}

	deleteChild(parent, id)
	validate(parent)
}

//============//
// Connecting //
//============//
export const replaceNod = (parent, { original, replacement } = {}) => {
	const originalNod = parent.children[original]
	const replacementNod = parent.children[replacement]

	replacementNod.inputs = [...originalNod.inputs]
	replacementNod.outputs = [...originalNod.outputs]
	originalNod.inputs = []
	originalNod.outputs = []

	for (const input of replacementNod.inputs) {
		const wire = parent.children[input]
		wire.target = replacement
	}

	for (const output of replacementNod.outputs) {
		const wire = parent.children[output]
		wire.source = replacement
	}

	validate(parent)
	validate(originalNod)
	validate(replacementNod)
}

export const reconnectWire = (parent, { id, source, target } = {}) => {
	const wireNogan = parent.children[id]
	const originalSource = parent.children[wireNogan.source]
	const originalTarget = parent.children[wireNogan.target]
	const replacementSource = parent.children[source] ?? originalSource
	const replacementTarget = parent.children[target] ?? originalTarget

	if (originalSource !== replacementSource) {
		const sourceIndex = originalSource.outputs.indexOf(id)
		originalSource.outputs.splice(sourceIndex, 1)
		replacementSource.outputs.push(id)
		wireNogan.source = source
	}

	if (originalTarget !== replacementTarget) {
		const targetIndex = originalTarget.inputs.indexOf(id)
		originalTarget.inputs.splice(targetIndex, 1)
		replacementTarget.inputs.push(id)
		wireNogan.target = target
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
export const addPulse = (parent, { id, colour = "blue", type = "any" }) => {
	const nod = parent.children[id]
	if (!nod) {
		throw new Error(`Can't find nod with id '${id}'`)
	}
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

export const addFullPulse = (parent, { id } = {}) => {
	for (const colour of PULSE_COLOURS) {
		addPulse(parent, { id, colour })
	}
}

//===========//
// Modifying //
//===========//
export const modifyNod = (parent, { id, type, position } = {}) => {
	const nod = parent.children[id]
	nod.type = type ?? nod.type
	nod.position = position ?? nod.position

	validate(parent)
	validate(nod)
}

export const modifyWire = (parent, { id, colour, timing } = {}) => {
	const wire = parent.children[id]
	wire.colour = colour ?? wire.colour
	wire.timing = timing ?? wire.timing

	validate(parent)
	validate(wire)
}

//=========//
// Peaking //
//=========//
export const getPeak = (
	parent,
	{ id, colour = "blue", timing = 0, history = [], future = [] },
) => {
	const peak = _getPeak(parent, { id, colour, timing, history, future })
	validate(peak)
	validate(parent)
	return peak
}

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

export const createPeak = ({ result = false, type, template, operations = [] } = {}) => {
	if (!result) return N.FailPeak.make({ operations })
	return N.SuccessPeak.make({ result, type, template })
}

const getPeakNow = (parent, { id, colour, history, future }) => {
	// First, let's try to find a real pulse
	const nod = parent.children[id]
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
		const wire = parent.children[input]

		if (wire.colour !== "any" && wire.colour !== colour) {
			continue
		}

		const peak = getPeak(parent, {
			id: wire.source,
			timing: -wire.timing,
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

// Peak refers to the input that is causing this nod to fire
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

export const getFullPeak = (parent, { id, timing = 0, history = [] } = {}) => {
	const fullPeak = N.FullPeak.make()
	for (const colour of PULSE_COLOURS) {
		const peak = getPeak(parent, { id, colour, timing, history })
		fullPeak[colour] = peak
	}
	validate(fullPeak)
	return fullPeak
}

//============//
// Projecting //
//============//
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
// Propogate iterates through all nods
// ... and makes them fire if they should be firing.
//
// It's quite a heavy function to be calling so often.
// We could cut down its use, and also optimise it a lot.
// But so far it's been fine!
export const propogate = (
	parent,
	{ clone = structuredClone(parent), history = [], future = [], timing = 0 } = {},
) => {
	for (const _id in clone.children) {
		const id = +_id
		const child = clone.children[id]
		if (!child.isNod) continue
		const fullPeak = getFullPeak(clone, { id, history, future, timing })
		for (const colour of PULSE_COLOURS) {
			const peak = fullPeak[colour]
			for (const operation of peak.operations) {
				operate(parent, { id, operation })
			}
			if (!peak.result) continue
			addPulse(parent, { id, colour, type: peak.type })
		}
	}
	validate(parent)
	return parent
}

export const advance = (parent, { history = [] } = {}) => {
	const projection = project(parent)
	return propogate(projection, {
		clone: parent,
		history,
		timing: 1,
	})
}

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

	const advancedParent = advance(parent, { history })
	for (const id of firingChildrenIds) {
		const child = advancedParent.children[id]
		const childHistory = history.map((parent) => parent.children[id])
		const advancedChild = deepAdvance(child, { history: childHistory })
		advancedParent.children[id] = advancedChild
	}
	return advancedParent
}

export const operate = (parent, { id, operation }) => {
	const _operate = OPERATES[operation.type]
	if (!_operate) {
		throw new Error(`Unknown operation type '${operation.type}'`)
	}

	return _operate(parent, { id, data: operation.data })
}
