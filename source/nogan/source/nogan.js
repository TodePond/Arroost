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

export const addChild = (nogan, child) => {
	const id = createId(nogan)
	child.id = id
	nogan.children[id] = child

	validate(child)
	validate(nogan)

	//TODO: update stuff!

	return nogan
}

//==========//
// Creating //
//==========//
export const createPhantom = () => {
	const phantom = NoganSchema.Phantom.make()
	return phantom
}

export const createNod = (parent, options = {}) => {
	const nod = NoganSchema.Nod.make()
	Object.assign(nod, options)
	addChild(parent, nod)
	return nod
}

export const createWire = (parent, options = {}) => {
	const wire = NoganSchema.Wire.make()
	Object.assign(wire, options)
	addChild(parent, wire)
	return wire
}

//========//
// Firing //
//========//
export const fire = (parent, { source, target, type = "any", colour = "all" } = {}) => {
	// If the target is already pulsed, then we don't need to do anything.
	const targetNogan = parent.children[target]
	if (targetNogan.pulse[type][colour]) {
		return parent
	}

	// Update the target and fire an event.
	targetNogan.pulse[type][colour] = true
	fireEvent("pulse", {
		detail: {
			parent,
			source,
			target,
			type,
			colour,
		},
	})

	// Spread the pulse to connected nogans.
	for (const id of targetNogan.outputs) {
		const wire = parent.children[id]
		if (wire.timing !== "same") continue
		if (colour !== "all" && wire.colour !== colour) continue

		const nextTarget = wire.target
		const nextType = type === "any" ? target.type : type
		const nextColour = type === "all" ? wire.colour : colour

		fire({
			parent,
			source: target,
			target: nextTarget,
			type: nextType,
			colour: nextColour,
		})
	}

	validate(parent)
	return parent
}

//=========//
// Ticking //
//=========//
export const advance = (nogan) => {
	// Advance pulse
	if (!nogan.isPhantom) {
		const { pulse } = nogan
		for (const type in pulse) {
			for (const colour in pulse[type]) {
				pulse[type][colour] = false
			}
		}
	}

	// Advance children
	for (const id in nogan.children) {
		const child = nogan.children[id]
		advance(child)
	}

	validate(nogan)
	return nogan
}

//=========//
// Project //
//=========//
export const project = (nogan, func = () => {}) => {
	const projected = structuredClone(nogan)
	func(projected)
	return projected
}
