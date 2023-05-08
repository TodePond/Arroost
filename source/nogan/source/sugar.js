import { fireEvent } from "../../../libraries/habitat-import.js"
import { addChild, validate } from "./nogan.js"
import { NoganSchema } from "./schema.js"

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
export const pulse = (parent, { source, target, type = "any", colour = "all" } = {}) => {
	target = parent.children[target]
	source = parent.children[source]

	if (target.pulse[type][colour]) {
		return
	}
	target.pulse[type][colour] = true
	fireEvent("pulse", { detail: { parent, source, target, type, colour } })
	for (const id of target.outputs) {
		const wire = parent.children[id]
		if (wire.timing !== "same") {
			continue
		}
		if (wire.colour !== colour) {
			continue
		}

		const nextTarget = wire.connectedOutput
		const nextType = type === "any" ? target.type : type
		const nextColour = type === "all" ? wire.colour : colour

		pulse({
			parent,
			source: target,
			target: nextTarget,
			type: nextType,
			colour: nextColour,
		})
	}

	validate(parent)
}

//=========//
// Ticking //
//=========//
export const advance = (nogan) => {
	const advanced = structuredClone(nogan)

	// Advance pulse
	if (!advanced.isPhantom) {
		const { pulse } = advanced
		for (const type in pulse) {
			for (const colour in pulse[type]) {
				pulse[type][colour] = false
			}
		}
	}

	// Advance children
	for (const id in advanced.children) {
		const child = advanced.children[id]
		advanced.children[id] = advance(child)
	}

	validate(advanced)
	return advanced
}
