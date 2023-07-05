import { NoganSchema, PULSE_COLOURS } from "./schema.js"

const N = NoganSchema

//============//
// Validating //
//============//
export const validate = (nogan, schema = NoganSchema[nogan.schemaName]) => {
	if (window.shared && !window.shared.debug.validate) {
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

export const createWire = (parent, { source, target } = {}, properties = {}) => {
	const wire = N.Wire.make(properties)
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
export const addPulse = (parent, { target, colour = "blue", type = "any" }) => {
	const nodNod = parent.children[target]
	const { pulses } = nodNod
	const pulse = pulses[colour]

	// Don't do anything if we're already pulsing
	if (pulse?.type === type) {
		return
	}

	// Update our pulse
	pulses[colour] = N.Pulse.make({ type })

	validate(nodNod)
	validate(parent)
}

export const addFullPulse = (parent, { target } = {}) => {
	for (const colour of PULSE_COLOURS) {
		addPulse(parent, { target, colour })
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

const getPeakNow = (parent, { id, colour, history, future }) => {
	// First, let's try to find a real pulse
	const nod = parent.children[id]
	if (nod) {
		const pulse = nod.pulses[colour]
		if (pulse) {
			return N.Peak.make({ result: true, type: pulse.type })
		}
	}

	// Next, let's look through our inputs
	// to see if we can find a pulse
	for (const input of nod.inputs) {
		const wire = parent.children[input]
		const source = parent.children[wire.source]

		if (wire.colour !== colour) {
			continue
		}

		const peak = getPeak(parent, {
			id: source.id,
			timing: -wire.timing,
			colour,
			history,
			future,
		})

		if (peak.result) {
			const transformedPeak = behave(parent, {
				peak: peak,
				source: wire.source,
				target: id,
			})

			validate(transformedPeak)
			return transformedPeak
		}
	}

	// Too bad, we couldn't find a pulse
	return N.Peak.make({ result: false })
}

// Return a peak!
// The peak can get transformed
// (depending on what the source and target nods are)
export const behave = (parent, { peak, source, target }) => {
	const sourceNod = parent.children[source]
	return N.Peak.make({
		result: true,
		type: peak.type,
	})
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
			return N.Peak.make({ result: false })
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
			return N.Peak.make({ result: false })
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
// There's no particular reason why the API only provides for stepping forwards
// It's just... That's what Arroost needs right now

// Why do we have a shallow advance as well as a deep advance?
// That's because I'm first figuring out how to do this with a shallow advance
// And then I'll figure out how to do it with a deep advance

export const advance = (nogan, { history = [] } = {}) => {
	const projection = project(nogan)
	for (const _id in nogan.children) {
		const id = +_id
		const child = nogan.children[id]
		if (!child.isNod) continue
		const fullPeakAfter = getFullPeak(nogan, { id, timing: 1, history })
		for (const colour of PULSE_COLOURS) {
			const peak = fullPeakAfter[colour]
			if (!peak.result) continue
			addPulse(projection, { target: id, colour, type: peak.type })
		}
	}
	validate(projection)
	return projection
}
