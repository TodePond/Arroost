import { fireEvent } from "../../../libraries/habitat-import.js"
import { NoganSchema } from "./schema.js"

export const validate = (nogan, schema) => {
	if (window.shared && !window.shared.debug.validate) {
		return
	}
	schema.validate(nogan)
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

	//TODO: update connections (they might stick to the new child)
}

//==========//
// Creating //
//==========//
// Just creating a nogan within a nogan
export const createPhantom = () => {
	return NoganSchema.Phantom.make()
}

export const createChild = (schema, parent = shared.nogan.current, options = {}) => {
	const child = schema.make()
	Object.assign(child, options)

	addChild(parent, child)
	validate(child, schema)
	validate(parent, NoganSchema[parent.schemaName])

	return child
}

//=========//
// Setting //
//=========//
export const pulse = (parent, nod, pulseType, colour) => {
	nod.pulse[pulseType][colour] = true
	fireEvent("pulse", { parent, nod, pulseType, colour })
	for (const id of nod.outputs) {
		const wire = parent.children[id]
		if (wire.timing !== "same") {
			continue
		}
		if (wire.colour !== colour) {
			continue
		}

		const target = wire.connectedOutput
		const nextType = pulseType === "recording" ? nod.pulseType : pulseType
		const nextColour = pulseType === "all" ? wire.colour : colour

		pulse(parent, target, nextType, nextColour)
	}
}

export const connectOutput = (nogan, wire) => {
	//TODO: disconnect wire from previous input if we need to
	nogan.outputs.push(wire)
	wire.connectedInput = nogan
	wire.position = nogan.position
	//TODO: update firing of the wire, and any outputs
}

//=========//
// Ticking //
//=========//
export const getTicked = (nogan) => {
	const ticked = JSON.parse(JSON.stringify(nogan))
	if (nogan.isParent) {
		if (!nogan.isPhantom) {
			ticked.pulse = getTickedPulse(ticked.pulse)
		}

		for (const id in ticked.children) {
			ticked.children[id] = getTicked(ticked.children[id])
		}
	}
	const schema = NoganSchema[nogan.schemaName]
	validate(ticked, schema)
	return ticked
}

export const getTickedPulse = (pulse) => {
	const ticked = JSON.parse(JSON.stringify(pulse))
	for (const type in pulse) {
		for (const colour in pulse[type]) {
			ticked[type][colour] = false
		}
	}
	validate(ticked, NoganSchema.Pulse)
	return ticked
}
