import { fireEvent } from "../../../libraries/habitat-import.js"
import { NoganSchema } from "./schema.js"

export const validate = (nogan, schema = NoganSchema[nogan.schemaName]) => {
	if (window.shared && !window.shared.debug.validate) {
		return
	}
	try {
		schema.validate(nogan)
	} catch (error) {
		console.error(schema.diagnose(nogan))
		throw error
	}
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

// This function is dangerous, and should only be used by smarter helper functions.
// All it does is add something to the nogan.
// It doesn't trigger any behaviours that should happen.
// This should be done by the helper functions themselves.
export const addChild = (nogan, child, { validates = true } = {}) => {
	const id = createId(nogan)
	child.id = id
	nogan.children[id] = child

	if (validates) {
		validate(child)
		validate(nogan)
	}

	return nogan
}

//==========//
// Creating //
//==========//
export const createPhantom = () => {
	const phantom = NoganSchema.Phantom.make()
	return phantom
}

export const createNod = (parent) => {
	const nod = NoganSchema.Nod.make()
	addChild(parent, nod)
	return nod
}

export const createWire = (parent, { source, target, colour = "all", timing = "now" } = {}) => {
	const wire = NoganSchema.Wire.make()
	wire.source = source
	wire.target = target
	wire.colour = colour
	wire.timing = timing
	addChild(parent, wire)

	const sourceNogan = parent.children[source]
	const targetNogan = parent.children[target]
	sourceNogan.outputs.push(wire.id)
	targetNogan.inputs.push(wire.id)

	validate(sourceNogan)
	validate(targetNogan)

	return wire
}

//========//
// Firing //
//========//
export const fire = (parent, { source, child, type = "any", colour = "all" } = {}) => {
	// If the target is already pulsed, then we don't need to do anything.
	const childNogan = parent.children[child]
	if (childNogan.pulse[type][colour]) {
		return parent
	}

	// Update the target and fire an event.
	childNogan.pulse[type][colour] = true
	fireEvent("pulse", {
		detail: {
			parent,
			source,
			child,
			type,
			colour,
		},
	})

	const transformedType = type === "any" && childNogan.type !== "any" ? childNogan.type : type

	// Spread the pulse to connected nogans.
	for (const outputId of childNogan.outputs) {
		const outputNogan = parent.children[outputId]
		if (colour !== "all" && outputNogan.colour !== colour) continue

		const { target } = outputNogan
		const targetNogan = parent.children[target]
		const shouldFire = evaluateFire(parent, {
			child: targetNogan.id,
			history: [],
			type: transformedType,
			colour,
		})

		if (shouldFire) {
			fire(parent, {
				source: childNogan.id,
				child: targetNogan.id,
				type: transformedType,
				colour,
			})
		}
	}

	validate(parent)
	return parent
}

export const evaluateFire = (
	parent,
	{ child, history = [], type = "any", colour = "all" } = {},
) => {
	const childNogan = parent.children[child]

	// If the child is already firing, then we don't need to do anything.
	if (childNogan.pulse[type][colour]) {
		return true
	}

	// If the child is not firing, then we need to check if it should be
	// Let's loop through all its inputs to find out!
	for (const inputId of childNogan.inputs) {
		const inputNogan = parent.children[inputId]
		const source = inputNogan.source
		const sourceNogan = parent.children[source]

		// If the input is simultaneous, just check if it's firing right now.
		if (inputNogan.timing === "now") {
			const shouldFire = evaluateFire(parent, {
				child: sourceNogan.id,
				history,
				type,
				colour,
			})
			if (shouldFire) return true
		}

		// If the input is delayed, we need to check if it fired in the past.
		// We do this by checking the history.
		// Note: We might not have a long enough history to check. That's ok!
		else if (inputNogan.timing === "after") {
			const [parentBefore, ...rest] = history
			if (parentBefore) {
				const shouldFire = evaluateFire(parentBefore, {
					child: sourceNogan.id,
					history: rest,
					type,
					colour,
				})
				if (shouldFire) return true
			}
		}

		// If the input is early, we need to check if it will fire in the future.
		// We do this by checking the future.
		else if (inputNogan.timing === "before") {
			const parentAfter = project(parent, advance)
		}
	}
}

//=========//
// Ticking //
//=========//
// Only advances children, not the parent
export const advance = (parent) => {
	const parentNow = parent
	const parentBefore = structuredClone(parent)

	for (const childId in parentBefore.children) {
		const childBefore = parentBefore.children[childId]
		const childNow = parentNow.children[childId]

		const pulseBefore = childBefore.pulse
		const pulseNow = childNow.pulse

		for (const type in pulseBefore) {
			for (const colour in pulseBefore[type]) {
				// If a child is firing...
				// - Put out the fire!
				// - Advance its children too!
				if (pulseBefore[type][colour]) {
					pulseNow[type][colour] = false
					advance(childNow)
				}
			}
		}
	}

	// Now that we've put out all fires...
	// Let's check if any children should be firing.
	for (const childId in parentNow.children) {
		const childNow = parentNow.children[childId]

		for (const type in childNow.pulse) {
			for (const colour in childNow.pulse[type]) {
				const shouldFire = evaluateFire(parentNow, {
					child: childNow.id,
					history: [parentBefore],
					type,
					colour,
				})
				if (shouldFire) {
					fire(parentNow, {
						source: parentNow.id,
						child: childNow.id,
						type,
						colour,
					})
				}
			}
		}
	}

	validate(parent)
	return parent
}

//=========//
// Project //
//=========//
export const project = (nogan, func = () => {}, args = []) => {
	const projected = structuredClone(nogan)
	func(projected, args)
	return projected
}
