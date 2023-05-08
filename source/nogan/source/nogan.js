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

	//validate(child)
	//validate(nogan)

	//TODO: update connections (they might stick to the new child)
}

//==========//
// Creating //
//==========//

//=========//
// Setting //
//=========//
export const pulse = ({ parent, source, target, type = "any", colour = "all" } = {}) => {
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
}

export const connectOutput = (nod, wire) => {
	//TODO: disconnect wire from previous input if we need to
	nod.outputs.push(wire)
	wire.source = nod
	//TODO: update firing of the wire, and any outputs
}

export const connectInput = (nod, wire) => {
	//TODO: disconnect wire from previous output if we need to
	nod.inputs.push(wire)
	wire.target = nod
	//TODO: update firing of the nod, and any outputs
}

export const connectSource = (wire, source) => {
	return connectOutput(source, wire)
}

//=========//
// Ticking //
//=========//
export const getTicked = (nogan) => {
	const ticked = structuredClone(nogan)
	if (nogan.isParent) {
		if (!nogan.isPhantom) {
			ticked.pulse = getTickedPulse(ticked.pulse)
		}

		for (const id in ticked.children) {
			ticked.children[id] = getTicked(ticked.children[id])
		}
	}

	validate(ticked)
	return ticked
}

export const getTickedPulse = (pulse) => {
	const ticked = structuredClone(pulse)
	for (const type in pulse) {
		if (type === "schemaName") {
			continue
		}
		for (const colour in pulse[type]) {
			ticked[type][colour] = false
		}
	}
	validate(ticked)
	return ticked
}
